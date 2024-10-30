// scripts.js

document.getElementById('search').addEventListener('input', function(event) {
    const searchTerm = event.target.value.toLowerCase();
    const postWrappers = document.querySelectorAll('.post-wrapper');

    postWrappers.forEach(wrapper => {
        const title = wrapper.querySelector('.post-link').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            wrapper.style.display = "block"; // Show matching post
        } else {
            wrapper.style.display = "none"; // Hide non-matching post
        }
    });
});

// List of blog posts with their titles, summaries, and links
const posts = [
    
    {
        title: "Three.js RPG Prototype", 
        summary: "My first game developed for the web. I might not finish it. My friend made our own sprites for this!",
        link: "threejsrpg/index.html",
        image:"images/posts/post4.png",
        date: "October 29, 2024",
        tags: ["Game Dev", "Javascript" , "Three.js", "Cannon.js"]
    },

    
    { 
        title: "Canvas vector graphics", 
        summary: "HTML Canvas & Javascript project with vector graphics.",
        link: "vector-adventure/index.html",
        image:"images/posts/post3.png",
        date: "October 22, 2024",
        tags: ["Game Dev", "HTML", "Javascript", "Canvas"]
    },

    { 
        title: "WebGL practise", 
        summary: "WebGL & Javascript practise with gl-matrix library. It took too much of my machines resources.. Better to keep my projects efficient and not that heavy.",
        link: "webgl-practise/index.html",
        image:"images/posts/post2.png",
        date: "October 22, 2024",
        tags: ["Game Dev", "Javascript", "WebGL", "gl-matrix"]
    },

    { 
        title: "Web game practice", 
        summary: "Wicked abomination of a game prototype with three.js! I also did some nginx server stuff with simple socket.io stuff and hosted it myself.. So the prototype is not available through github pages.",
        link: "",
        image: "images/posts/post1.gif",
        date: "October 22, 2024",
        tags: ["Game Dev", "Three.js", "Mixamo.com"]
    },

];


// Function to render blog posts dynamically
function renderPosts() {
    const blogPostsContainer = document.getElementById('blog-posts');
    blogPostsContainer.innerHTML = ''; // Clear existing posts if needed

    posts.forEach(post => {
        const postWrapper = document.createElement('div');
        postWrapper.className = 'post-wrapper';

        const postImage = document.createElement('img');
        postImage.src = post.image || "default_image.png"; // Fallback if no image
        postImage.alt = post.title;

        const postLink = document.createElement('a');
        postLink.href = "#"; // Change to post.link if you want direct links
        postLink.className = 'post-link';
        postLink.textContent = post.title;

        postWrapper.addEventListener('click', () => openModal(post)); // Open modal on click

        const postDate = document.createElement('p');
        postDate.className = 'post-date';
        postDate.textContent = post.date;

        const postTags = document.createElement('div');
        postTags.className = 'post-tags';

        post.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'tag';
            tagElement.textContent = tag;
            postTags.appendChild(tagElement); // Append each tag individually
        });

        postWrapper.appendChild(postImage);
        postWrapper.appendChild(postLink);
        postWrapper.appendChild(postDate);
        postWrapper.appendChild(postTags);
        blogPostsContainer.appendChild(postWrapper); // Append to container
    });
}

// Function to open the modal with post preview
function openModal(post) {
    const modal = document.getElementById('post-modal');
    const modalContent = document.getElementById('modal-post-content');
    modalContent.innerHTML = `<h2>${post.title}</h2><p>${post.summary}</p><a href="${post.link}">Try this prototype if available.</a>`;
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
