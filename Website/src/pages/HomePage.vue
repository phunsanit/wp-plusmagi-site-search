<template>
  <div class="site">
    <header>
      <a class="brand" href="#top"><img src="/icon-128x128.png" alt="" />PlusMagi <b>Site Search</b></a>
      <nav aria-label="Main navigation"><a href="#features">Features</a><a href="#access">Access</a><a href="#setup">Setup</a></nav>
      <a class="header-cta" href="https://wordpress.org/plugins/plusmagi-site-search" target="_blank" rel="noopener">Get plugin ↗</a>
    </header>

    <main id="top">
      <section class="hero">
        <div class="hero-content">
          <p class="eyebrow">WordPress plugin · v1.0.2</p>
          <h1>Find the content<br />your site already has.</h1>
          <p class="lead">Fast, permission-aware search across posts, taxonomy, and custom fields. One search box, useful results, no external index.</p>
          <div class="actions">
            <a class="primary" href="https://wordpress.org/plugins/plusmagi-site-search" target="_blank" rel="noopener">Install from WordPress ↗</a>
            <a class="secondary" href="https://pitt.plusmagi.com/" target="_blank" rel="noopener">Explore live demo</a>
          </div>
        </div>
        <small>Live search on a real WordPress site</small>
      </section>

      <section class="proof" aria-label="Plugin highlights">
        <div><b>3</b><span>result types</span></div><div><b>0</b><span>external services</span></div><div><b>1</b><span>lightweight plugin</span></div>
        <p>Posts, categories, and tags stay organized while WordPress remains the source of truth.</p>
      </section>

      <section id="features" class="section">
        <div class="section-title"><p class="eyebrow dark">Built for useful answers</p><h2>Search beyond titles.</h2><p>Surface the details people remember, even when they do not remember the page.</p></div>
        <div class="feature-grid">
          <article class="feature wide"><span>01</span><h3>Deep content search</h3><p>Match post content, custom fields, SKUs, internal codes, categories, and tags from one request.</p><div class="queries"><code>post: release notes</code><code>category: documentation</code><code>tag: live-search</code></div></article>
          <article class="feature"><span>02</span><h3>Results with context</h3><p>Featured images, content types, dates, and grouped tabs make every match easier to scan.</p></article>
          <article class="feature inverse"><span>03</span><h3>Native by design</h3><p>Runs through the WordPress REST API and inherits theme colors. No hosted search account required.</p><em>● WordPress connected</em></article>
        </div>
      </section>

      <section class="preview">
        <div class="preview-copy"><p class="eyebrow">Interactive preview</p><h2>Clear results,<br />where you type.</h2><p>The three-tab layout separates content from taxonomy without sending visitors to another page.</p><div><span>Keyboard friendly</span><span>Debounced</span><span>Theme aware</span></div></div>
        <div class="search-demo">
          <div class="browser"><i></i><i></i><i></i><small>your-site.com</small></div>
          <div class="demo-content">
            <label for="query">Search this site</label>
            <div class="input"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input id="query" v-model="query" type="search" /><kbd>⌘ K</kbd></div>
            <div class="tabs" role="tablist">
              <button v-for="tab in tabs" :key="tab.key" type="button" role="tab" :aria-selected="activeTab === tab.key" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">{{ tab.label }} <span>{{ results[tab.key].length }}</span></button>
            </div>
            <div class="results">
              <a v-for="item in filteredResults" :key="item.title" href="#setup"><b>{{ item.mark }}</b><span><strong>{{ item.title }}</strong><small>{{ item.meta }}</small></span><i>↗</i></a>
              <p v-if="!filteredResults.length">No matches. Try another phrase.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="access" class="section access">
        <div class="section-title"><p class="eyebrow dark">Permission aware</p><h2>Users see only what they should.</h2><p>Results respect WordPress roles and content status on every request.</p></div>
        <div class="role-wrap"><div class="roles"><div><span>Role</span><span>Published</span><span>Own drafts</span><span>All private</span></div><div><b>Visitor</b><span>✓</span><span>—</span><span>—</span></div><div><b>Author</b><span>✓</span><span>✓</span><span>—</span></div><div><b>Editor / Admin</b><span>✓</span><span>✓</span><span>✓</span></div></div></div>
      </section>

      <section id="setup" class="setup">
        <div><p class="eyebrow dark">Quick setup</p><h2>From install to search in three steps.</h2></div>
        <ol><li><span>01</span><div><b>Install</b><p>Add the plugin from WordPress.org or upload the release zip.</p></div></li><li><span>02</span><div><b>Activate</b><p>Enable PlusMagi Site Search in the Plugins screen.</p></div></li><li><span>03</span><div><b>Place</b><p>Add the shortcode where search should appear.</p><code>[plusmagi-site-search]</code></div></li></ol>
      </section>

      <section class="final-cta"><img src="/icon-256x256.png" alt="" /><div><p>Search should uncover content, not hide it.</p><h2>Put better search on your WordPress site.</h2></div><a href="https://wordpress.org/plugins/plusmagi-site-search" target="_blank" rel="noopener">Get PlusMagi ↗</a></section>
    </main>

    <footer><a class="brand" href="#top"><img src="/icon-128x128.png" alt="" />PlusMagi <b>Site Search</b></a><p>Open-source WordPress search, built by PlusMagi.</p><a href="https://wordpress.org/plugins/plusmagi-site-search" target="_blank" rel="noopener">WordPress.org ↗</a></footer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Tab = 'posts' | 'category' | 'tag'
const activeTab = ref<Tab>('posts')
const query = ref('search')
const tabs: { key: Tab; label: string }[] = [{ key: 'posts', label: 'Posts' }, { key: 'category', label: 'Categories' }, { key: 'tag', label: 'Tags' }]
const results = {
  posts: [{ title: 'Configure PlusMagi Search', meta: 'Guide · Updated today', mark: 'P' }, { title: 'WooCommerce SKU Search', meta: 'Documentation · 4 min read', mark: 'P' }, { title: 'Internal Knowledge Base', meta: 'Private · Post', mark: 'P' }],
  category: [{ title: 'Documentation', meta: 'Category · 18 posts', mark: 'C' }, { title: 'WooCommerce', meta: 'Category · 7 posts', mark: 'C' }],
  tag: [{ title: 'live-search', meta: 'Tag · 9 posts', mark: 'T' }, { title: 'sku-filter', meta: 'Tag · 4 posts', mark: 'T' }],
} as const
const filteredResults = computed(() => {
  const value = query.value.trim().toLowerCase()
  return !value || value === 'search' ? results[activeTab.value] : results[activeTab.value].filter(item => `${item.title} ${item.meta}`.toLowerCase().includes(value))
})
</script>

<style scoped>
.site{color:#17211b;background:#f6f7f2}.brand{display:flex;align-items:center;gap:8px;width:max-content;color:inherit;text-decoration:none;font-size:14px}.brand img{width:32px;height:32px;border-radius:6px}header{position:absolute;z-index:3;inset:0 0 auto;height:74px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 clamp(20px,5vw,72px);color:#fff;border-bottom:1px solid #ffffff40}nav{display:flex;gap:28px}nav a,footer>a{color:inherit;text-decoration:none;font-size:12px;font-weight:700}.header-cta{justify-self:end;padding:10px 14px;color:#17211b;background:#ffd52e;text-decoration:none;font-size:12px;font-weight:800}.hero{position:relative;min-height:min(760px,92svh);display:flex;align-items:flex-end;overflow:hidden;color:#fff;background:#17362c url('/plugin-assets/banner-1544x500.png') center/cover no-repeat}.hero:after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,#0b1c17fa 0%,#0b1c17c7 40%,#0b1c1714 75%),linear-gradient(0deg,#091914cc,transparent 45%)}.hero-content{position:relative;z-index:1;width:min(720px,90%);margin:0 0 clamp(58px,10vh,100px) clamp(20px,8vw,128px)}.eyebrow{margin:0 0 18px;color:#dfe9e3;font:500 10px 'DM Mono',monospace;text-transform:uppercase}.eyebrow:before{content:'';display:inline-block;width:22px;height:2px;margin:0 10px 3px 0;background:#ffd52e}.eyebrow.dark{color:#68756c}.hero h1{margin:0;font-size:clamp(46px,6.5vw,94px);line-height:.95;letter-spacing:0}.lead{max-width:620px;margin:26px 0 30px;color:#d5dfd8;font-size:clamp(16px,1.4vw,20px);line-height:1.65}.actions{display:flex;flex-wrap:wrap;gap:10px}.actions a{padding:15px 18px;text-decoration:none;font-size:12px;font-weight:800}.primary{color:#17211b;background:#ffd52e}.secondary{color:#fff;border:1px solid #ffffff80}.hero>small{position:absolute;z-index:1;right:28px;bottom:20px;color:#ffffffb3;font:9px 'DM Mono',monospace;text-transform:uppercase}.proof{display:grid;grid-template-columns:repeat(3,minmax(130px,170px)) 1fr;color:#fff;background:#1d4e42}.proof div{min-height:120px;display:flex;flex-direction:column;justify-content:center;padding:20px 34px;border-right:1px solid #ffffff2e}.proof b{color:#ffd52e;font:500 28px 'DM Mono',monospace}.proof span{font-size:10px;text-transform:uppercase}.proof p{align-self:center;max-width:550px;padding:25px clamp(24px,6vw,90px);color:#d6e2dc;line-height:1.6}.section{padding:clamp(76px,10vw,136px) clamp(20px,7vw,110px)}.section-title{display:grid;grid-template-columns:.8fr 1.25fr 1fr;gap:40px;align-items:end;margin-bottom:48px}.section-title h2,.preview h2,.setup h2,.final-cta h2{margin:0;font-size:clamp(36px,4.3vw,62px);line-height:1.03}.section-title>p:last-child{margin:0;color:#68756c;line-height:1.7}.feature-grid{display:grid;grid-template-columns:1.35fr 1fr 1fr;border-top:1px solid #c5ccc6;border-left:1px solid #c5ccc6}.feature{min-height:360px;display:flex;flex-direction:column;padding:clamp(26px,3vw,42px);border-right:1px solid #c5ccc6;border-bottom:1px solid #c5ccc6}.feature>span{margin-bottom:auto;color:#7b887f;font:11px 'DM Mono',monospace}.feature h3{margin:50px 0 13px;font-size:24px}.feature p{margin:0;color:#68756c;line-height:1.7}.wide{background:#fff}.inverse{color:#fff;background:#17211b}.inverse p{color:#b8c4bc}.inverse em{margin-top:28px;color:#85dfa9;font:normal 9px 'DM Mono',monospace;text-transform:uppercase}.queries{display:grid;gap:6px;margin-top:26px}.queries code,.setup code{width:max-content;max-width:100%;padding:8px 10px;overflow-wrap:anywhere;color:#245044;background:#edf0e8;font:10px 'DM Mono',monospace}.preview{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(50px,8vw,125px);align-items:center;padding:clamp(76px,10vw,136px) clamp(20px,8vw,128px);color:#fff;background:#1c344c}.preview-copy>p:not(.eyebrow){color:#c3d1dc;line-height:1.75}.preview-copy>div{display:flex;flex-wrap:wrap;gap:7px;margin-top:30px}.preview-copy>div span{padding:7px 9px;border:1px solid #ffffff35;font:9px 'DM Mono',monospace;text-transform:uppercase}.search-demo{max-width:720px;color:#17211b;background:#fff;box-shadow:22px 22px 0 #ffd52e}.browser{height:42px;display:flex;align-items:center;gap:6px;padding:0 15px;background:#e9edea}.browser i{width:7px;height:7px;border-radius:50%;background:#929f97}.browser small{margin-left:10px;color:#68756c;font:9px 'DM Mono',monospace}.demo-content{padding:clamp(20px,4vw,44px)}label{display:block;margin-bottom:9px;font-size:11px;font-weight:800}.input{height:52px;display:grid;grid-template-columns:20px 1fr auto;gap:9px;align-items:center;padding:0 13px;border:2px solid #1d4e42}.input svg{width:18px;fill:none;stroke:currentColor;stroke-width:1.8}.input input{min-width:0;border:0;outline:0;background:transparent;font-weight:700}.input kbd{font:9px 'DM Mono',monospace}.tabs{display:grid;grid-template-columns:repeat(3,1fr);margin-top:17px;border-bottom:1px solid #d6ddd8}.tabs button{min-width:0;padding:11px 3px;border:0;border-bottom:2px solid transparent;color:#68756c;background:none;font-size:10px;cursor:pointer}.tabs button.active{color:#1d4e42;border-color:#1d4e42}.results{min-height:210px}.results>a{display:grid;grid-template-columns:34px 1fr auto;gap:11px;align-items:center;padding:13px 3px;color:inherit;text-decoration:none;border-bottom:1px solid #e0e5e1}.results>a>b{width:32px;height:32px;display:grid;place-items:center;color:#1d4e42;background:#edf0e8;font:10px 'DM Mono',monospace}.results strong,.results small{display:block}.results strong{font-size:11px}.results small{margin-top:3px;color:#77837b;font-size:9px}.results>a>i{font-style:normal}.results>p{text-align:center;color:#77837b;font-size:11px;padding-top:50px}.access{background:#fff}.role-wrap{overflow-x:auto}.roles{min-width:560px;border-top:2px solid #17211b}.roles>div{min-height:68px;display:grid;grid-template-columns:1.4fr repeat(3,1fr);align-items:center;border-bottom:1px solid #d3d9d4}.roles span,.roles b{padding:12px;text-align:center;font-size:12px}.roles b,.roles span:first-child{text-align:left}.roles>div:first-child{min-height:46px;color:#68756c;font:9px 'DM Mono',monospace;text-transform:uppercase}.roles>div:not(:first-child) span{color:#16794f;font-weight:800}.setup{display:grid;grid-template-columns:1fr 1.1fr;gap:clamp(50px,9vw,140px);padding:clamp(76px,10vw,136px) clamp(20px,8vw,128px);background:#eef0e8}.setup ol{margin:0;padding:0;list-style:none;border-top:2px solid #17211b}.setup li{display:grid;grid-template-columns:50px 1fr;gap:14px;padding:24px 0;border-bottom:1px solid #c5ccc6}.setup li>span{font:10px 'DM Mono',monospace}.setup li b{font-size:17px}.setup li p{margin:6px 0 0;color:#68756c;line-height:1.6}.setup code{display:block;margin-top:11px}.final-cta{display:grid;grid-template-columns:auto 1fr auto;gap:28px;align-items:center;padding:clamp(42px,6vw,80px) clamp(20px,8vw,128px);background:#ffd52e}.final-cta img{width:80px;height:80px;border-radius:14px}.final-cta p{margin:0 0 6px;font:9px 'DM Mono',monospace;text-transform:uppercase}.final-cta h2{font-size:clamp(28px,3vw,44px)}.final-cta a{padding:14px 17px;color:#fff;background:#17211b;text-decoration:none;font-size:12px;font-weight:800}footer{min-height:96px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:20px clamp(20px,5vw,72px);color:#dce5df;background:#101813}footer p{font-size:10px}footer>a:last-child{justify-self:end}
@media(max-width:900px){nav{display:none}header{grid-template-columns:1fr auto}.proof{grid-template-columns:repeat(3,1fr)}.proof p{grid-column:1/-1}.section-title{grid-template-columns:1fr 1fr}.section-title .eyebrow{grid-column:1/-1}.feature-grid{grid-template-columns:1fr 1fr}.wide{grid-column:1/-1}.preview,.setup{grid-template-columns:1fr}.final-cta{grid-template-columns:auto 1fr}.final-cta a{grid-column:2;width:max-content}}
@media(max-width:620px){header{height:66px}.header-cta{padding:9px}.hero{min-height:690px;background-position:66% center}.hero:after{background:linear-gradient(90deg,#0b1c17f5,#0b1c17a8),linear-gradient(0deg,#091914d9,transparent)}.hero-content{margin-bottom:55px}.hero h1{font-size:clamp(42px,13vw,60px)}.hero>small{display:none}.actions{flex-direction:column}.actions a{text-align:center}.proof{grid-template-columns:1fr}.proof div{min-height:84px;border-bottom:1px solid #ffffff2e}.proof p{grid-column:auto}.section-title{grid-template-columns:1fr;gap:18px}.section-title .eyebrow{grid-column:auto}.feature-grid{grid-template-columns:1fr}.wide{grid-column:auto}.feature{min-height:300px}.search-demo{box-shadow:10px 10px 0 #ffd52e}.demo-content{padding:17px}.tabs button{font-size:8px}.final-cta{grid-template-columns:1fr}.final-cta a{grid-column:auto}footer{grid-template-columns:1fr;gap:12px;padding-block:28px}footer>a:last-child{justify-self:start}}
</style>