// scripts.js

// List of blog posts with their titles, summaries, and links
const posts = [
    { 
        title: "My First Post", 
        summary: "Welcome to my first blog post! This is where I share my thoughts.",
        link: "posts/post1.html"
    },
    { 
        title: "Another Day, Another Post", 
        summary: "This is my second blog post! More to come.",
        link: "posts/post2.html"
    }
];

// Function to render blog posts
function renderPosts() {
    const blogPostsContainer = document.getElementById('blog-posts');
    
    posts.forEach(post => {
        const postLink = document.createElement('a');
        postLink.href = "#";
        postLink.className = 'post-link';
        postLink.textContent = post.title;
        
        postLink.addEventListener('click', () => openModal(post));

        blogPostsContainer.appendChild(postLink);
    });
}

// Function to open the modal with post preview
function openModal(post) {
    const modal = document.getElementById('post-modal');
    const modalContent = document.getElementById('modal-post-content');
    modalContent.innerHTML = `<h2>${post.title}</h2><p>${post.summary}</p><a href="${post.link}">Read Full Post</a>`;
    modal.style.display = "block";
}

// Function to close the modal
function closeModal() {
    document.getElementById('post-modal').style.display = "none";
}

// Event listener for modal close button
document.querySelector('.close').addEventListener('click', closeModal);

// Run the renderPosts function when the page loads
window.onload = renderPosts;

// Close the modal when clicking outside of the modal content
window.onclick = function(event) {
    const modal = document.getElementById('post-modal');
    if (event.target === modal) {
        closeModal();
    }
}
