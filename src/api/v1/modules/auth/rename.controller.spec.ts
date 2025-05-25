import { Test, TestingModule } from '@nestjs/testing';

describe("", () => {
  // let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [], // NOTE: services like authService, adminService, etc.
    }).compile();

    // []Controller = app.get<>();
  });

  describe("root", () => {
    it("", () => {
        // TODO: Implement describe()
    });
  });
});
