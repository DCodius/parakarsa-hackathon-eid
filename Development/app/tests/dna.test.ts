import assert from "node:assert/strict";
import { test } from "node:test";
import { shortenHash } from "../src/lib/chain.ts";
import { axesWithEvidence, epScore, maskNik, pillarsOf, scoreOf } from "../src/lib/dna.ts";

/** PRD 3.3: NIK di DNA Portfolio harus tampil tersamar dan rapi. */
test("maskNik menyisakan empat digit awal dan akhir", () => {
  assert.equal(maskNik("3204012345678901"), "3204 •••• •••• 8901");
});

test("maskNik menerima NIK yang sudah berspasi", () => {
  assert.equal(maskNik("3204 0123 4567 8901"), "3204 •••• •••• 8901");
});

test("maskNik menolak input terlalu pendek daripada membocorkan digit", () => {
  assert.equal(maskNik("3204"), "••••");
});

test("epScore adalah rata-rata enam sumbu DNA", () => {
  assert.equal(epScore, 74);
});

test("bukti LMS menaikkan pilar Talenta dan dibatasi EVIDENCE_CAP", () => {
  assert.equal(scoreOf(axesWithEvidence(0)), 74);
  assert.equal(pillarsOf(axesWithEvidence(1))[0].score, 79);
  assert.equal(
    pillarsOf(axesWithEvidence(99))[0].score,
    pillarsOf(axesWithEvidence(3))[0].score,
  );
});

test("shortenHash memotong tengah, bukan ekor", () => {
  assert.equal(shortenHash("0x1234567890abcdef1234567890", 6), "0x1234…567890");
  assert.equal(shortenHash("0x1234", 6), "0x1234");
});
