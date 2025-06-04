import { createRule, DecoratedType, DecoratorApplication, Model, Type } from "@typespec/compiler";
import { SyntaxKind } from "@typespec/compiler/ast";

export const invalidPagingResultSchemaRule = createRule({
  name: "invalid-paging-result-schema",
  description:
    "models decorator @pageResult should contain one property decoratored with @items, one property decoratored with @nextLink",
  severity: "warning",
  messages: {
    default:
      "Models decoratored @pageResult should contain one property decoratored with @items, one property decoratored with @nextLink",
  },
  create(context) {
    return {
      model: (model: Model) => {
        const decorator = getpageResultDecoratorOnType(model);
        if (decorator) {
          let hasItems = false;
          let hasNextlink = false;
          model.properties.forEach((key, value) => {
            hasItems =
              hasItems ||
              (key as DecoratedType).decorators.some(
                (x) =>
                  x.decorator.name === "$items" &&
                  x.node?.kind === SyntaxKind.DecoratorExpression &&
                  x.node?.parent === key.node,
              );

            hasNextlink =
              hasNextlink ||
              (key as DecoratedType).decorators.some(
                (x) =>
                  x.decorator.name === "$nextLink" &&
                  x.node?.kind === SyntaxKind.DecoratorExpression &&
                  x.node?.parent === key.node,
              );
          });

          if (!hasItems || !hasNextlink) {
            context.reportDiagnostic({
              target: model,
            });
          }
        }
      },
    };
  },
});

function getpageResultDecoratorOnType(model: Model): DecoratorApplication | undefined {
  const decorators = model.decorators.filter(
    (x) =>
      x.decorator.name === "$pagedResult" &&
      x.node?.kind === SyntaxKind.DecoratorExpression &&
      x.node?.parent === model.node,
  );

  return decorators.length > 0 ?decorators[0] : undefined;
}
