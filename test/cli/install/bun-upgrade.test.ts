import { spawn, spawnSync } from "bun";
import { beforeEach, expect, it } from "bun:test";
import { bunExe, bunEnv as env, tmpdirSync } from "harness";
import { join } from "path";
import { copyFileSync } from "js/node/fs/export-star-from";
import { upgrade_test_helpers } from "bun:internal-for-testing";
const { openTempDirWithoutSharingDelete, closeTempDirHandle } = upgrade_test_helpers;

let run_dir: string;
let exe_name: string = "bun-debug" + (process.platform === "win32" ? ".exe" : "");

beforeEach(async () => {
  run_dir = tmpdirSync();
  copyFileSync(bunExe(), join(run_dir, exe_name));
});

it("two invalid arguments, should display error message and suggest command", async () => {
  console.log(run_dir, exe_name);
  const { stderr } = spawn({
    cmd: [join(run_dir, exe_name), "upgrade", "bun-types", "--dev"],
    cwd: run_dir,
    stdout: null,
    stdin: "pipe",
    stderr: "pipe",
    env,
  });

  const err = await new Response(stderr).text();
  expect(err.split(/\r?\n/)).toContain("error: This command updates Bun itself, and does not take package names.");
  expect(err.split(/\r?\n/)).toContain("note: Use `bun update bun-types --dev` instead.");
});

it("two invalid arguments flipped, should display error message and suggest command", async () => {
  const { stderr } = spawn({
    cmd: [join(run_dir, exe_name), "upgrade", "--dev", "bun-types"],
    cwd: run_dir,
    stdout: null,
    stdin: "pipe",
    stderr: "pipe",
    env,
  });

  const err = await new Response(stderr).text();
  expect(err.split(/\r?\n/)).toContain("error: This command updates Bun itself, and does not take package names.");
  expect(err.split(/\r?\n/)).toContain("note: Use `bun update --dev bun-types` instead.");
});

it("one invalid argument, should display error message and suggest command", async () => {
  const { stderr } = spawn({
    cmd: [join(run_dir, exe_name), "upgrade", "bun-types"],
    cwd: run_dir,
    stdout: null,
    stdin: "pipe",
    stderr: "pipe",
    env,
  });

  const err = await new Response(stderr).text();
  expect(err.split(/\r?\n/)).toContain("error: This command updates Bun itself, and does not take package names.");
  expect(err.split(/\r?\n/)).toContain("note: Use `bun update bun-types` instead.");
});

it("one valid argument, should succeed", async () => {
  const { stderr } = spawn({
    cmd: [join(run_dir, exe_name), "upgrade", "--help"],
    cwd: run_dir,
    stdout: null,
    stdin: "pipe",
    stderr: "pipe",
    env,
  });

  const err = await new Response(stderr).text();
  // Should not contain error message
  expect(err.split(/\r?\n/)).not.toContain("error: This command updates bun itself, and does not take package names.");
  expect(err.split(/\r?\n/)).not.toContain("note: Use `bun update --help` instead.");
});

it("two valid argument, should succeed", async () => {
  const { stderr } = spawn({
    cmd: [join(run_dir, exe_name), "upgrade", "--stable", "--profile"],
    cwd: run_dir,
    stdout: null,
    stdin: "pipe",
    stderr: "pipe",
    env,
  });

  const err = await new Response(stderr).text();
  // Should not contain error message
  expect(err.split(/\r?\n/)).not.toContain("error: This command updates Bun itself, and does not take package names.");
  expect(err.split(/\r?\n/)).not.toContain("note: Use `bun update --stable --profile` instead.");
});

it("zero arguments, should succeed", async () => {
  const server = Bun.serve({
    tls: {
      cert: "-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAKLdQVPy90jjMA0GCSqGSIb3DQEBCwUAMEUxCzAJBgNV\nBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYDVQQKDBhJbnRlcm5ldCBX\naWRnaXRzIFB0eSBMdGQwHhcNMTkwMjAzMTQ0OTM1WhcNMjAwMjAzMTQ0OTM1WjBF\nMQswCQYDVQQGEwJBVTETMBEGA1UECAwKU29tZS1TdGF0ZTEhMB8GA1UECgwYSW50\nZXJuZXQgV2lkZ2l0cyBQdHkgTHRkMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIB\nCgKCAQEA7i7IIEdICTiSTVx+ma6xHxOtcbd6wGW3nkxlCkJ1UuV8NmY5ovMsGnGD\nhJJtUQ2j5ig5BcJUf3tezqCNW4tKnSOgSISfEAKvpn2BPvaFq3yx2Yjz0ruvcGKp\nDMZBXmB/AAtGyN/UFXzkrcfppmLHJTaBYGG6KnmU43gPkSDy4iw46CJFUOupc51A\nFIz7RsE7mbT1plCM8e75gfqaZSn2k+Wmy+8n1HGyYHhVISRVvPqkS7gVLSVEdTea\nUtKP1Vx/818/HDWk3oIvDVWI9CFH73elNxBkMH5zArSNIBTehdnehyAevjY4RaC/\nkK8rslO3e4EtJ9SnA4swOjCiqAIQEwIDAQABo1AwTjAdBgNVHQ4EFgQUv5rc9Smm\n9c4YnNf3hR49t4rH4yswHwYDVR0jBBgwFoAUv5rc9Smm9c4YnNf3hR49t4rH4ysw\nDAYDVR0TBAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEATcL9CAAXg0u//eYUAlQa\nL+l8yKHS1rsq1sdmx7pvsmfZ2g8ONQGfSF3TkzkI2OOnCBokeqAYuyT8awfdNUtE\nEHOihv4ZzhK2YZVuy0fHX2d4cCFeQpdxno7aN6B37qtsLIRZxkD8PU60Dfu9ea5F\nDDynnD0TUabna6a0iGn77yD8GPhjaJMOz3gMYjQFqsKL252isDVHEDbpVxIzxPmN\nw1+WK8zRNdunAcHikeoKCuAPvlZ83gDQHp07dYdbuZvHwGj0nfxBLc9qt90XsBtC\n4IYR7c/bcLMmKXYf0qoQ4OzngsnPI5M+v9QEHvYWaKVwFY4CTcSNJEwfXw+BAeO5\nOA==\n-----END CERTIFICATE-----",
      key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDuLsggR0gJOJJN\nXH6ZrrEfE61xt3rAZbeeTGUKQnVS5Xw2Zjmi8ywacYOEkm1RDaPmKDkFwlR/e17O\noI1bi0qdI6BIhJ8QAq+mfYE+9oWrfLHZiPPSu69wYqkMxkFeYH8AC0bI39QVfOSt\nx+mmYsclNoFgYboqeZTjeA+RIPLiLDjoIkVQ66lznUAUjPtGwTuZtPWmUIzx7vmB\n+pplKfaT5abL7yfUcbJgeFUhJFW8+qRLuBUtJUR1N5pS0o/VXH/zXz8cNaTegi8N\nVYj0IUfvd6U3EGQwfnMCtI0gFN6F2d6HIB6+NjhFoL+QryuyU7d7gS0n1KcDizA6\nMKKoAhATAgMBAAECggEAd5g/3o1MK20fcP7PhsVDpHIR9faGCVNJto9vcI5cMMqP\n6xS7PgnSDFkRC6EmiLtLn8Z0k2K3YOeGfEP7lorDZVG9KoyE/doLbpK4MfBAwBG1\nj6AHpbmd5tVzQrnNmuDjBBelbDmPWVbD0EqAFI6mphXPMqD/hFJWIz1mu52Kt2s6\n++MkdqLO0ORDNhKmzu6SADQEcJ9Suhcmv8nccMmwCsIQAUrfg3qOyqU4//8QB8ZM\njosO3gMUesihVeuF5XpptFjrAliPgw9uIG0aQkhVbf/17qy0XRi8dkqXj3efxEDp\n1LSqZjBFiqJlFchbz19clwavMF/FhxHpKIhhmkkRSQKBgQD9blaWSg/2AGNhRfpX\nYq+6yKUkUD4jL7pmX1BVca6dXqILWtHl2afWeUorgv2QaK1/MJDH9Gz9Gu58hJb3\nymdeAISwPyHp8euyLIfiXSAi+ibKXkxkl1KQSweBM2oucnLsNne6Iv6QmXPpXtro\nnTMoGQDS7HVRy1on5NQLMPbUBQKBgQDwmN+um8F3CW6ZV1ZljJm7BFAgNyJ7m/5Q\nYUcOO5rFbNsHexStrx/h8jYnpdpIVlxACjh1xIyJ3lOCSAWfBWCS6KpgeO1Y484k\nEYhGjoUsKNQia8UWVt+uWnwjVSDhQjy5/pSH9xyFrUfDg8JnSlhsy0oC0C/PBjxn\nhxmADSLnNwKBgQD2A51USVMTKC9Q50BsgeU6+bmt9aNMPvHAnPf76d5q78l4IlKt\nwMs33QgOExuYirUZSgjRwknmrbUi9QckRbxwOSqVeMOwOWLm1GmYaXRf39u2CTI5\nV9gTMHJ5jnKd4gYDnaA99eiOcBhgS+9PbgKSAyuUlWwR2ciL/4uDzaVeDQKBgDym\nvRSeTRn99bSQMMZuuD5N6wkD/RxeCbEnpKrw2aZVN63eGCtkj0v9LCu4gptjseOu\n7+a4Qplqw3B/SXN5/otqPbEOKv8Shl/PT6RBv06PiFKZClkEU2T3iH27sws2EGru\nw3C3GaiVMxcVewdg1YOvh5vH8ZVlxApxIzuFlDvnAoGAN5w+gukxd5QnP/7hcLDZ\nF+vesAykJX71AuqFXB4Wh/qFY92CSm7ImexWA/L9z461+NKeJwb64Nc53z59oA10\n/3o2OcIe44kddZXQVP6KTZBd7ySVhbtOiK3/pCy+BQRsrC7d71W914DxNWadwZ+a\njtwwKjDzmPwdIXDSQarCx0U=\n-----END PRIVATE KEY-----",
      passphrase: "1234",
    },
    port: 0,
    async fetch() {
      return new Response(
        JSON.stringify({
          "tag_name": "bun-v1.1.4",
          "assets": [
            {
              "url": "foo",
              "content_type": "application/zip",
              "name": "bun-windows-x64.zip",
              "browser_download_url": `https://pub-5e11e972747a44bf9aaf9394f185a982.r2.dev/releases/latest/bun-windows-x64.zip`,
            },
            {
              "url": "foo",
              "content_type": "application/zip",
              "name": "bun-windows-x64-baseline.zip",
              "browser_download_url": `https://pub-5e11e972747a44bf9aaf9394f185a982.r2.dev/releases/latest/bun-windows-x64-baseline.zip`,
            },
            {
              "url": "foo",
              "content_type": "application/zip",
              "name": "bun-linux-x64.zip",
              "browser_download_url": `https://pub-5e11e972747a44bf9aaf9394f185a982.r2.dev/releases/latest/bun-linux-x64.zip`,
            },
            {
              "url": "foo",
              "content_type": "application/zip",
              "name": "bun-linux-x64-baseline.zip",
              "browser_download_url": `https://pub-5e11e972747a44bf9aaf9394f185a982.r2.dev/releases/latest/bun-linux-x64-baseline.zip`,
            },
            {
              "url": "foo",
              "content_type": "application/zip",
              "name": "bun-darwin-x64.zip",
              "browser_download_url": `https://pub-5e11e972747a44bf9aaf9394f185a982.r2.dev/releases/latest/bun-darwin-x64.zip`,
            },
            {
              "url": "foo",
              "content_type": "application/zip",
              "name": "bun-darwin-x64-baseline.zip",
              "browser_download_url": `https://pub-5e11e972747a44bf9aaf9394f185a982.r2.dev/releases/latest/bun-darwin-x64-baseline.zip`,
            },
            {
              "url": "foo",
              "content_type": "application/zip",
              "name": "bun-darwin-aarch64.zip",
              "browser_download_url": `https://pub-5e11e972747a44bf9aaf9394f185a982.r2.dev/releases/latest/bun-darwin-aarch64.zip`,
            },
          ],
        }),
      );
    },
  });

  // On windows, open the temporary directory without FILE_SHARE_DELETE before spawning
  // the upgrade process. This is to test for EBUSY errors
  openTempDirWithoutSharingDelete();

  const { stderr } = spawnSync({
    cmd: [join(run_dir, exe_name), "upgrade"],
    cwd: run_dir,
    stdout: null,
    stdin: "pipe",
    stderr: "pipe",
    env: {
      ...env,
      NODE_TLS_REJECT_UNAUTHORIZED: "0",
      GITHUB_API_DOMAIN: `localhost:${server.port}`,
    },
  });

  server.stop();
  closeTempDirHandle();

  // Should not contain error message
  expect(stderr.toString()).not.toContain("error:");
});
