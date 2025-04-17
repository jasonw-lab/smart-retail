import path from "path";
import { createDefineMock } from "vite-plugin-mock-dev-server";

// https://vite-plugin-mock-dev-server.netlify.app/guide/define-mock

export const defineMockApi = createDefineMock((mock) => {
  // 拼接url
  mock.url = path.join(import.meta.env.VITE_APP_BASE_API + "api/v1/", mock.url);
});
