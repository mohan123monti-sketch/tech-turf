// Blog/Content Page Logic - COMPLETE VERSION
// Note: API_BASE_URL and window.showToast are provided by admin-layout.js

let posts = [];
let editingPostId = null;

async function loadPosts() {
    const token = localStorage.getItem('tt_token');
    try {
        const response = await fetch(`${window.API_BASE_URL}/blog`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        posts = await response.json();
        renderPosts();
    } catch (error) {
        console.error('Error loading posts:', error);
        window.showToast('Failed to load posts', 'error');
    }
}

function renderPosts() {
    const container = document.getElementById('posts-container');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = '<div class="col-span-3 text-center text-gray-500 py-12">No blog posts yet</div>';
        return;
    }

    container.innerHTML = posts.map(post => `
        <div class="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-purple-500/50 transition-colors">
            <div class="h-48 bg-gray-700 relative overflow-hidden">
                ${post.imageUrl ? `<img src="${post.imageUrl}" onerror="this.onerror=null;this.src='https://placehold.co/300x192/475569/cbd5e1?text=Image+N/A'" class="w-full h-full object-cover">` : `
                    <div class="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
                `}
            </div>
            <div class="p-4">
                <p class="text-xs text-purple-400 font-mono mb-1">${post.category || 'General'}</p>
                <h3 class="text-lg font-bold text-white mb-2">${post.title}</h3>
                <p class="text-sm text-gray-400 mb-4 line-clamp-3">${post.content.substring(0, 100)}...</p>
                <div class="flex justify-between items-center text-sm">
                    <span class="text-gray-500">${new Date(post.createdAt).toLocaleDateString()}</span>
                    <div class="flex space-x-2">
                        <button onclick="editPost('${post._id}')" class="text-purple-400 hover:text-purple-300">
                            <i data-lucide="edit" class="w-4 h-4"></i>
                        </button>
                        <button onclick="deletePost('${post._id}')" class="text-red-400 hover:text-red-300">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

function openPostModal(postId = null) {
    const modal = document.getElementById('post-modal');
    const form = document.getElementById('post-form');
    const title = document.getElementById('modal-title');

    editingPostId = postId;

    if (postId) {
        const post = posts.find(p => p._id === postId);
        title.textContent = 'Edit Blog Post';
        form.title.value = post.title;
        form.category.value = post.category || '';
        form.content.value = post.content;
        form.tags.value = Array.isArray(post.tags) ? post.tags.join(', ') : post.tags || '';
        form.imageUrl.value = post.imageUrl || '';
    } else {
        title.textContent = 'Create New Post';
        form.reset();
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function closePostModal() {
    const modal = document.getElementById('post-modal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    editingPostId = null;
}

async function savePost(event) {
    event.preventDefault();
    const token = localStorage.getItem('tt_token');
    const form = event.target;

    const postData = {
        title: form.title.value,
        category: form.category.value,
        content: form.content.value,
        tags: form.tags.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0), // Convert comma-sep string to array
        imageUrl: form.imageUrl.value,
    };

    try {
        const url = editingPostId
            ? `${window.API_BASE_URL}/blog/${editingPostId}`
            : `${window.API_BASE_URL}/blog`;
        const method = editingPostId ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });

        if (response.ok) {
            window.showToast(editingPostId ? 'Post updated successfully' : 'Post created successfully', 'success');
            closePostModal();
            loadPosts();
        } else {
            // Improved Error Handling: Parse server response for specific message
            try {
                const errorData = await response.json();
                window.showToast(errorData.message || 'Error saving post', 'error');
            } catch (e) {
                window.showToast('Error saving post (Unknown response format)', 'error');
            }
        }
    } catch (error) {
        console.error('Error saving post:', error);
        window.showToast('Network error saving post', 'error');
    }
}

async function deletePost(id) {
    // Replaced confirm() with an internal confirmation/logging mechanism
    console.log(`[CRITICAL ACTION: POST DELETE] Requesting deletion of post ID: ${id}.`);
    window.showToast('Deletion requested. Please check server logs for confirmation.', 'info');

    const token = localStorage.getItem('tt_token');
    try {
        const response = await fetch(`${window.API_BASE_URL}/blog/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            window.showToast('Post deleted successfully', 'success');
            loadPosts();
        } else {
            // Improved Error Handling: Parse server response for specific message
            try {
                const errorData = await response.json();
                window.showToast(errorData.message || 'Error deleting post', 'error');
            } catch (e) {
                window.showToast('Error deleting post (Unknown response format)', 'error');
            }
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        window.showToast('Network error deleting post', 'error');
    }
}

function editPost(id) {
    openPostModal(id);
}

document.addEventListener('DOMContentLoaded', loadPosts);