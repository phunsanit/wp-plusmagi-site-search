<template>
  <div class="min-h-screen bg-[#040f1c] text-[#dee9fc] font-sans">
    <!-- TopAppBar -->
    <nav class="fixed top-0 w-full z-50 bg-[rgba(9,20,33,0.7)] backdrop-blur-lg shadow-lg h-20 flex items-center">
      <div class="flex justify-between items-center w-full px-8 max-w-7xl mx-auto h-full">
        <div class="flex items-center gap-8">
          <a href="https://plusmagi-site-search.plusmagi.com" target="_blank" rel="noopener noreferrer" class="text-xl font-bold text-[#d9e3f6] tracking-tighter">PlusMagi Site Search</a>
          <div class="hidden md:flex gap-6">
            <a class="text-[#ffb4a4] font-bold border-b-2 border-[#ff5634] pb-1 tracking-tighter" href="#home">Home</a>
            <a class="text-[#d9e3f6]/80 hover:text-[#ffb4a4] tracking-tighter" href="#documentation">Documentation</a>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <a href="https://wordpress.org/plugins/plusmagi-site-search" target="_blank" rel="noopener noreferrer" class="bg-[#e12a00] text-white px-6 py-2 font-bold tracking-tighter text-sm rounded-sm hover:bg-[#ff5c3b] transition-all active:scale-95">Get Started</a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <main class="pt-24">
      <section id="home" class="relative min-h-[707px] flex flex-col justify-center items-center px-8 text-center overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,48,3,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        <div class="max-w-4xl relative z-10">
          <span class="text-[#ff8f77] tracking-[0.2em] font-bold text-[0.6875rem] uppercase mb-6 block">VERSION 1.0.2 NOW LIVE</span>
          <h1 class="text-5xl md:text-7xl font-extrabold tracking-[-0.04em] leading-[1.1] mb-8">
            Powerful Search for <br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8f77] to-[#e12a00]">Modern WordPress</span> Sites
          </h1>
          <p class="text-[#a1acbd] text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Transform your standard WordPress search into a high-performance, deep-indexed architectural component built for scale.
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://pitt.plusmagi.com/" target="_blank" rel="noopener noreferrer" class="bg-[#e12a00] text-white px-10 py-4 font-bold tracking-tighter rounded-sm hover:bg-[#ff5c3b] transition-all active:scale-95">Live Demo</a>
            <a href="https://wordpress.org/plugins/plusmagi-site-search" target="_blank" rel="noopener noreferrer" class="bg-[#ff8f77] text-[#4b0700] px-10 py-4 font-bold tracking-tighter rounded-sm hover:bg-[#ffb4a4] transition-all active:scale-95">Get Started</a>
          </div>
          <img
            :src="bannerImage"
            alt="PlusMagi Site Search banner"
            class="mt-10 w-full max-w-4xl rounded border border-[#3e4958] shadow-2xl shadow-[#e12a00]/20"
          />
        </div>
      </section>

      <!-- Features Section -->
      <section class="max-w-4xl mx-auto mt-16 px-4">
        <h2 class="text-3xl font-bold mb-8 text-[#ff8f77]">Features</h2>
        <div class="overflow-x-auto mb-8">
          <table class="min-w-full border border-[#3e4958] rounded text-left">
            <thead class="bg-[#172739]">
              <tr>
                <th class="py-2 px-4 border-b border-[#3e4958]">Role</th>
                <th class="py-2 px-4 border-b border-[#3e4958]">Can See</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="py-2 px-4 border-b border-[#3e4958]">Public</td>
                <td class="py-2 px-4 border-b border-[#3e4958]">Published posts only</td>
              </tr>
              <tr>
                <td class="py-2 px-4 border-b border-[#3e4958]">Author</td>
                <td class="py-2 px-4 border-b border-[#3e4958]">Own drafts/pending + all published</td>
              </tr>
              <tr>
                <td class="py-2 px-4">Admin/Editor</td>
                <td class="py-2 px-4">Everything (all statuses)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <ul class="grid md:grid-cols-2 gap-6 text-left">
          <li><b>Strict Access Control</b> (see table above)</li>
          <li><b>Advanced Filtering & Search Logic</b> (Custom Fields, Prefixes)</li>
          <li><b>Rich Results</b> (Thumbnails, Tabs)</li>
          <li><b>Admin-Like UI</b></li>
          <li><b>Theme Integration</b></li>
          <li><b>High Performance</b> (AJAX, Lightweight)</li>
          <li><b>Developer Friendly</b> (Shortcode, Block support)</li>
        </ul>

        <h3 class="text-xl font-semibold mt-10 mb-3">3-Tab Search Preview</h3>
        <p class="text-[#a1acbd] mb-4">Example result layout grouped into Posts, Category, and Tag tabs.</p>
        <div class="border border-[#3e4958] rounded overflow-hidden">
          <div class="grid grid-cols-3 bg-[#172739] text-sm font-semibold">
            <button
              type="button"
              class="px-4 py-3 border-r border-[#3e4958] text-left transition-colors"
              :class="activePreviewTab === 'posts' ? 'text-[#ffb4a4] bg-[#1f3349]' : 'text-[#c8d3e6] hover:text-[#ffb4a4]'"
              @click="activePreviewTab = 'posts'"
            >
              Posts (3)
            </button>
            <button
              type="button"
              class="px-4 py-3 border-r border-[#3e4958] text-left transition-colors"
              :class="activePreviewTab === 'category' ? 'text-[#ffb4a4] bg-[#1f3349]' : 'text-[#c8d3e6] hover:text-[#ffb4a4]'"
              @click="activePreviewTab = 'category'"
            >
              Category (2)
            </button>
            <button
              type="button"
              class="px-4 py-3 text-left transition-colors"
              :class="activePreviewTab === 'tag' ? 'text-[#ffb4a4] bg-[#1f3349]' : 'text-[#c8d3e6] hover:text-[#ffb4a4]'"
              @click="activePreviewTab = 'tag'"
            >
              Tag (2)
            </button>
          </div>

          <div class="bg-[#0d1c2e] p-4 space-y-3">
            <div
              v-for="item in previewResults[activePreviewTab]"
              :key="`${activePreviewTab}-${item.title}`"
              class="rounded border border-[#2b3f58] bg-[#13263c] p-3"
            >
              <div class="text-[#ffb4a4] font-semibold">{{ item.title }}</div>
              <div class="text-[#a1acbd] text-sm">{{ item.meta }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Documentation Section -->
      <section id="documentation" class="max-w-4xl mx-auto mt-16 px-4">
        <h2 class="text-3xl font-bold mb-8 text-[#ff8f77]">Documentation</h2>
        <h3 class="text-xl font-semibold mt-4 mb-2">Installation</h3>
        <ol class="list-decimal list-inside mb-6 space-y-1">
          <li>Download <b>plusmagi-site-search.zip</b> from the <b>build/</b> folder or generate it with <code>./build.sh</code></li>
          <li>Upload the zip file to the Plugins page in your WordPress admin</li>
          <li>Click Activate to enable the plugin</li>
        </ol>
        <h3 class="text-xl font-semibold mt-4 mb-2">Add to Theme</h3>
        <ul class="list-disc list-inside space-y-1 mb-6">
          <li>Add <code>[plusmagi-site-search]</code> to any page or post content</li>
          <li>Or insert the shortcode directly in your theme file, for example:<br>
            <code>&lt;?php echo do_shortcode('[plusmagi-site-search]'); ?&gt;</code>
          </li>
        </ul>
        <div class="bg-[#172739] rounded p-4 text-sm text-[#dee9fc]">
          <b>Tip:</b> You can customize the CSS via your theme or a Custom CSS plugin to match your site design.
        </div>

        <h3 class="text-xl font-semibold mt-8 mb-2">FAQ</h3>
        <div class="space-y-4">
          <div>
            <h4 class="font-semibold text-[#ffb4a4]">Does it support Private Posts?</h4>
            <p class="text-[#c8d3e6]">Yes, but only for users with the appropriate permissions (like Admins or Editors).</p>
          </div>
          <div>
            <h4 class="font-semibold text-[#ffb4a4]">Can it search WooCommerce SKUs?</h4>
            <p class="text-[#c8d3e6]">Yes. By enabling Custom Field search, it can index and find products by their SKU.</p>
          </div>
          <div>
            <h4 class="font-semibold text-[#ffb4a4]">Does it slow down my site?</h4>
            <p class="text-[#c8d3e6]">No, the plugin is optimized with lightweight Ajax calls to ensure high performance.</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import bannerImage from '../assets/banner-1544x500.png'

const activePreviewTab = ref<'posts' | 'category' | 'tag'>('posts')

const previewResults = {
  posts: [
    { title: 'How to Configure PlusMagi Search', meta: 'Published - Post' },
    { title: 'WooCommerce SKU Search Setup', meta: 'Published - Post' },
    { title: 'Internal Knowledge Base Search', meta: 'Private - Post' },
  ],
  category: [
    { title: 'Documentation', meta: 'Category Archive' },
    { title: 'WooCommerce', meta: 'Category Archive' },
  ],
  tag: [
    { title: 'live-search', meta: 'Tag Archive' },
    { title: 'sku-filter', meta: 'Tag Archive' },
  ],
} as const
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;800;900&display=swap');
.material-symbols-outlined {
  font-family: 'Material Symbols Outlined';
  font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
}
body {
  font-family: 'Inter', sans-serif;
}
</style>
