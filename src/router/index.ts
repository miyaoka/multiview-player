import { createRouter, createWebHistory } from "vue-router";
import LayoutDemoView from "@/views/LayoutDemoView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: LayoutDemoView,
    },
  ],
});

export default router;
