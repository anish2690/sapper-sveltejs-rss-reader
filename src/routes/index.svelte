<script>
    import { onMount } from 'svelte'
    import Article from '../components/Article.svelte'
    let showAddForm = false
    let rssUrl = 'https://news.ycombinator.com/rss'
    let rrsList = []
    let feedsContent = []

    onMount(async () => {
        const newRssList = await fetch('api/list').then(r => r.json())
        console.log(newRssList)
        rrsList = newRssList
    })
    const refreshFeeds = async () => {
        const feeds = await fetch('api/refresh').then(r => r.json())
        feedsContent = feeds
            .map(feed => {
                const { items, ...feedMeta } = feed
                return items.map(item => ({ ...item, feed: feedMeta }))
            })
            .reduce((acc, val) => acc.concat(val), [])
            .sort((a, b) => new Date(b.isoDate) - new Date(a.isoDate))
        console.log(feedsContent)
    }
    const toggleAddForm = () => {
        console.log(showAddForm)
        showAddForm = !showAddForm
    }

    const addRssToList = async () => {
        const { added, rrsList: newRssList } = await fetch('api/add', {
            method: 'POST',
            body: JSON.stringify({ url: rssUrl }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(r => r.json())
        console.log(newRssList)
        rrsList = newRssList
        if (added) refreshFeeds()
        showAddForm = false
    }
    const removeFromList = async url => {
        const { removed, rrsList: newRssList } = await fetch('api/del', {
            method: 'DELETE',
            body: JSON.stringify({ url }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(r => r.json())
        if (removed) {
            rrsList = newRssList
            refreshFeeds()
        }
    }
    const cancelAddButton = () => {
        showAddForm = false
    }
</script>

<style>
    .container {
        display: flex;
    }
    .feed-list {
        display: flex;
        padding: 10px;
        flex-direction: column;
    }
    .articles {
        display: flex;
        flex: 1;
        padding: 10px;
        flex-direction: column;
    }
    .add-feed {
        display: flex;
    }
    .feed-input {
        flex: 1;
    }
    .feed-actions {
        display: flex;
    }
    .articles-list {
        display: flex;
        flex: 1;
        flex-direction: column;
    }
</style>

<svelte:head>
    <title>Simple RSS Reader</title>
</svelte:head>
{#if showAddForm}
    <div class="add-feed">
        <button on:click={cancelAddButton}>Cancel</button>
        <input
            class="feed-input"
            type="text"
            placeholder="http://rss.feed.com"
            bind:value={rssUrl} />
        <button on:click={addRssToList}>Add Feeds</button>
    </div>
{/if}

<div class="container">
    <div class="feed-list">
        <button on:click={toggleAddForm}>Add</button>

        <ul>
            {#each rrsList as feed}
                <li>
                    {feed}
                    <button on:click={() => removeFromList(feed)}>
                        Remove
                    </button>

                </li>
            {/each}
        </ul>
    </div>
    <div class="articles">
        <div class="feed-actions">
            <button on:click={refreshFeeds}>Reload</button>
        </div>
        <div class="articles-list">
            {#each feedsContent as item}
                <Article {item} />
            {/each}
        </div>
    </div>

</div>
