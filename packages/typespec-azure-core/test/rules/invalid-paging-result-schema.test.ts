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

  it("invalid", async () => {
    await tester
      .expect(
        `
          @pagedResult
          model PageResult {
            size: int32;
            item: string[];
          }
          `,
      )
      .toEmitDiagnostics([
        {
          code: "@azure-tools/typespec-azure-core/invalid-paging-result-schema",
          message: `Models decoratored @pageResult should contain one property decoratored with @items, one property decoratored with @nextLink`,
        },
      ]);
  });
});
