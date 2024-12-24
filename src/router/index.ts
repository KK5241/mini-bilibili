import { createMemoryHistory, createRouter } from "vue-router";

import indexVue from "../views/IndexVue/index.vue";

const routes = [
  {
    path: "/",
    component: indexVue,
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
