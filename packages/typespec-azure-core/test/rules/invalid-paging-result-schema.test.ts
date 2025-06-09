import {
  BasicTestRunner,
  createLinterRuleTester,
  LinterRuleTester,
} from "@typespec/compiler/testing";
import { beforeEach, describe, it } from "vitest";
import { invalidPagingResultSchemaRule } from "../../src/rules/invalid-paging-result-schema.js";
import { createAzureCoreTestRunner } from "../test-host.js";

describe("typespec-azure-core: invalid-paging-result-schema rule", () => {
  let runner: BasicTestRunner;
  let tester: LinterRuleTester;

  beforeEach(async () => {
    runner = await createAzureCoreTestRunner();
    tester = createLinterRuleTester(
      runner,
      invalidPagingResultSchemaRule,
      "@azure-tools/typespec-azure-core",
    );
  });

  it("valid", async () => {
    await tester
      .expect(
        `
          @pagedResult("{name}Page", T)
          model Page<T> {
            size: int32;
            item: T[];
          }
          `,
      )
      .toBeValid();
  });
});
