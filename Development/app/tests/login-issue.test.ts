import assert from "node:assert/strict";
import { test } from "node:test";
import { describeLoginIssue } from "../src/lib/login-issue.ts";

test("gateway: copy tetap mengarahkan ke QR simulation", () => {
  const issue = describeLoginIssue("gateway", "Tidak bisa menghubungi gateway e.id: fetch failed");
  assert.equal(issue?.title, "Login browser belum sampai ke e.id.");
  assert.match(issue?.body ?? "", /QR simulation tetap tersedia/);
  assert.equal(issue?.action?.href, "/login");
});

test("no-email: menjelaskan akun gagal terbit, tanpa membocorkan pesan mentah", () => {
  const issue = describeLoginIssue("no-email", "Profil e.id tidak membawa email");
  assert.equal(
    issue?.body,
    "Akun e.id Anda tidak membawa email, jadi akun ParaKarsa tidak bisa dibuat dari login ini.",
  );
  assert.equal(issue?.action, undefined);
});

test("eid dan kode tak dikenal: pesan gateway tampil apa adanya", () => {
  assert.equal(describeLoginIssue("eid", "invalid_client")?.body, "invalid_client");
  assert.equal(describeLoginIssue(null, "Kredensial kedaluwarsa")?.body, "Kredensial kedaluwarsa");
});

test("tanpa pesan error tidak ada banner", () => {
  assert.equal(describeLoginIssue("gateway", null), null);
  assert.equal(describeLoginIssue(null, null), null);
});
