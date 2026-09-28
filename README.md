# Tide Lanterns

A one-minute reward round for a shared speech session. One template, three content packs. The therapist and the student watch the same lanterns.

## Run

```bash
node server.js
```

Open http://127.0.0.1:8741

Click **Student tablet**. That second window is the child. Themes, resets, nudges, the speech card, and the firefly pointer show up there as you use them.

`packs.json` is the content contract. Swap a word or a theme color and reload.

## Play

- Tap two lanterns with the same word. They meet, then rest around the moon.
- Drag a face-up lantern onto its match to finish the pair sooner.
- **Speech card** pauses the round and holds up a word.
- **Nudge** wiggles the match when a child is stuck.
- **Firefly** lets the therapist point without flipping cards.

## Sync

The therapist tab is the authority. The student tab sends intents (`reveal`, `drag`, `drop`) and renders snapshots. A `BroadcastChannel` stands in for the session socket you already have. Positions are normalized, so a laptop and a tablet can share one round.
