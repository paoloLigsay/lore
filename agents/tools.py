import os
from dataclasses import dataclass

import httpx
from langchain_core.tools import BaseTool, tool

_INTERNAL_BASE_URL = os.environ["NEXTJS_INTERNAL_URL"]
_INTERNAL_KEY = os.environ["AGENT_SERVICE_INTERNAL_KEY"]


def _internal_get(path: str, params: dict) -> dict:
    # A tool result, not a crash: a wrong/stale id is a normal agentic-loop
    # event the model should see and recover from (re-list, apologize, ask),
    # not an exception that takes down the whole turn. ToolNode's default
    # error handler only catches its own validation errors, so this has to
    # be handled here.
    try:
        full_url = f"{_INTERNAL_BASE_URL}{path}"
        response = httpx.get(
            full_url,
            params=params,
            headers={"X-Internal-Key": _INTERNAL_KEY},
            timeout=10.0,
        )
        response.raise_for_status()
        result = response.json()
        return result
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code == 404:
            return {
                "error": "Not found. The id argument must be exactly the "
                "`id` field from list_notes/list_sources — never the title. "
                "Call list_notes/list_sources again if you're unsure of it."
            }
        raise


@dataclass
class LoreTools:
    """The on-demand note/source tools, scoped to one turn's Lore. Split
    into subsets so Supervisor and each specialist can be bound only to
    the tools relevant to them (e.g. the Web specialist never gets
    source-fetching tools — it grounds in search results instead)."""

    list_notes: BaseTool
    get_note: BaseTool
    list_sources: BaseTool
    get_source: BaseTool

    def all(self) -> list[BaseTool]:
        return [self.list_notes, self.get_note, self.list_sources, self.get_source]

    def note_tools(self) -> list[BaseTool]:
        return [self.list_notes, self.get_note]

    def source_tools(self) -> list[BaseTool]:
        return [self.list_sources, self.get_source]


def build_lore_tools(lore_id: str) -> LoreTools:
    """Tools scoped to this turn's Lore, so the model can only ever look up
    notes/sources belonging to it — lore_id comes from the trusted request
    payload, never from the model.
    """

    @tool
    def list_notes() -> list[dict]:
        """List every note in this Lore. Returns objects with `id` (a UUID)
        and `title` — no content. To read one, call get_note with the exact
        `id` value from its object here — never its title."""
        return _internal_get(f"/api/internal/lores/{lore_id}/notes", {})["notes"]

    @tool
    def get_note(note_id: str) -> dict:
        """Get one note's full title and content. note_id must be the exact
        `id` field (a UUID) from a list_notes result — not a title, and not
        one you guess. Call list_notes first if you don't already have it."""
        return _internal_get(f"/api/internal/notes/{note_id}", {"loreId": lore_id})

    @tool
    def list_sources() -> list[dict]:
        """List every uploaded source in this Lore. Returns objects with
        `id` (a UUID) and `title` — no content. To read one, call
        get_source with the exact `id` value from its object here — never
        its title."""
        return _internal_get(f"/api/internal/lores/{lore_id}/sources", {})["sources"]

    @tool
    def get_source(source_id: str) -> dict:
        """Get one uploaded source's full title and content. source_id must
        be the exact `id` field (a UUID) from a list_sources result — not a
        title, and not one you guess. Call list_sources first if you don't
        already have it."""
        return _internal_get(f"/api/internal/sources/{source_id}", {"loreId": lore_id})

    return LoreTools(
        list_notes=list_notes,
        get_note=get_note,
        list_sources=list_sources,
        get_source=get_source,
    )
