import { createRouter, createWebHistory } from "vue-router";
import LayoutDemoView from "@/views/LayoutDemoView.vue";
import MultiPlayerView from "@/views/MultiPlayerView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: MultiPlayerView,
    },
    {
      path: "/demo",
      name: "demo",
      component: LayoutDemoView,
    },
  ],
});

export default router;
