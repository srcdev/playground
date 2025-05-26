import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        responsiveNavigation: './responsive-navigation.html',
        responsiveNavigationWithDetails: './responsive-navigation-with-details.html',
      },
    },
  },
});
