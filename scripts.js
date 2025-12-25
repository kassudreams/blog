// scripts.js

document.getElementById('search').addEventListener('input', function(event) {
    const searchTerm = event.target.value.toLowerCase();
    const postWrappers = document.querySelectorAll('.post-wrapper');

    postWrappers.forEach(wrapper => {
        const title = wrapper.querySelector('.post-link').textContent.toLowerCase();
        if (title.includes(searchTerm)) {
            wrapper.style.display = "block";
        } else {
            wrapper.style.display = "none";
        }
    });
});

// List of blog posts with their titles, summaries, and links
const posts = [
    
    {
        title: "Three.js RPG Prototype", 
        summary: "My first game developed for the web. I might not finish it. My friend made our own sprites for this!",
        link: "threejs-rpg/index.html",
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

// Function to create honeycomb layout
function createHoneycombLayout() {
    const blogPostsContainer = document.getElementById('blog-posts');
    blogPostsContainer.innerHTML = '';

    // Calculate how many rows we need
    const postsPerRow = 3;
    const totalRows = Math.ceil(posts.length / postsPerRow);
    
    let postIndex = 0;
    
    for (let row = 0; row < totalRows; row++) {
        const honeycombRow = document.createElement('div');
        honeycombRow.className = 'honeycomb-row';
        
        // Determine how many posts in this row
        const postsInThisRow = Math.min(postsPerRow, posts.length - postIndex);
        
        for (let col = 0; col < postsInThisRow; col++) {
            const post = posts[postIndex];
            const postWrapper = createHexagonPost(post);
            honeycombRow.appendChild(postWrapper);
            postIndex++;
        }
        
        blogPostsContainer.appendChild(honeycombRow);
    }
}

// Function to create a single hexagon post
function createHexagonPost(post) {
    const postWrapper = document.createElement('div');
    postWrapper.className = 'post-wrapper';

    const hexagon = document.createElement('div');
    hexagon.className = 'hexagon';

    const hexagonContent = document.createElement('div');
    hexagonContent.className = 'hexagon-content';

    const postImage = document.createElement('img');
    postImage.src = post.image || "default_image.png";
    postImage.alt = post.title;

    const postLink = document.createElement('a');
    postLink.href = "#";
    postLink.className = 'post-link';
    postLink.textContent = post.title;

    postWrapper.addEventListener('click', () => openModal(post));

    const postDate = document.createElement('p');
    postDate.className = 'post-date';
    postDate.textContent = post.date;

    const postTags = document.createElement('div');
    postTags.className = 'post-tags';

    post.tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        postTags.appendChild(tagElement);
    });

    hexagonContent.appendChild(postImage);
    hexagonContent.appendChild(postLink);
    hexagon.appendChild(hexagonContent);
    postWrapper.appendChild(hexagon);
    postWrapper.appendChild(postDate);
    postWrapper.appendChild(postTags);

    return postWrapper;
}

// Function to open the modal with post preview
function openModal(post) {
    const modal = document.getElementById('post-modal');
    const modalContent = document.getElementById('modal-post-content');
    
    const linkHtml = post.link ? `<a href="${post.link}" target="_blank" style="color: #ffffff; text-decoration: underline; font-weight: bold;">Try this prototype →</a>` : '<span style="color: rgba(255,255,255,0.7);">Prototype not available</span>';
    
    modalContent.innerHTML = `
        <h2 style="margin-bottom: 15px; font-size: 24px; font-weight: 300;">${post.title}</h2>
        <p style="margin-bottom: 20px; line-height: 1.6; opacity: 0.9;">${post.summary}</p>
        <div style="margin-bottom: 15px;">
            <strong style="color: rgba(255,255,255,0.8);">Date:</strong> ${post.date}
        </div>
        <div style="margin-bottom: 20px;">
            <strong style="color: rgba(255,255,255,0.8);">Tags:</strong> ${post.tags.map(tag => `<span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 10px; margin: 0 2px; font-size: 12px;">${tag}</span>`).join('')}
        </div>
        <div style="margin-top: 25px;">
            ${linkHtml}
        </div>
    `;
    modal.style.display = "block";
}

// Function to close the modal
function closeModal() {
    document.getElementById('post-modal').style.display = "none";
}

// Event listener for modal close button
document.querySelector('.close').addEventListener('click', closeModal);

// Run the createHoneycombLayout function when the page loads
window.onload = createHoneycombLayout;

// Close the modal when clicking outside of the modal content
window.onclick = function(event) {
    const modal = document.getElementById('post-modal');
    if (event.target === modal) {
        closeModal();
    }
}
