import * as utils from "@/utils";

describe("Plugin utils", () => {
  describe("Routes", () => {
    it("Should convert routes to RegExp", () => {
      const includeRoute1 = "/foo/bar";
      const excludeRoute1 = "/hi";

      const expectedPatterns = {
        includePatterns: [new RegExp(includeRoute1)],
        excludePatterns: [new RegExp(excludeRoute1)],
      };

      const actualPatterns = utils.compileRoutePatterns({
        includeRoutes: ["/foo/bar"],
        excludeRoutes: ["/hi"],
      });
      expect(actualPatterns).toMatchObject(expectedPatterns);
    });

    it("'excludeRoutes' should take priority over 'includeRoutes'", () => {
      const currentRoute = "/hi";
      const routePatterns = utils.compileRoutePatterns({
        includeRoutes: "*",
        excludeRoutes: [currentRoute, "/foo/bar"],
      });

      const shouldRouteBeCached = utils.shouldCacheRoute({
        ...routePatterns,
        route: currentRoute,
      });
      expect(shouldRouteBeCached).toBeFalsy();
    });
  });
});
