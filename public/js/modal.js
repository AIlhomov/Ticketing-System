/**
 * Open modal
 * @param {string} src - image source
 * @returns {void}
 * @see {@link https://www.w3schools.com/howto/howto_css_modal_images.asp}
 */
function openModal(src) {
    var modal = document.getElementById("myModal");
    var modalImg = document.getElementById("imgModal");
    modal.style.display = "block";
    modalImg.src = src;
}

function closeModal() {
    var modal = document.getElementById("myModal");
    modal.style.display = "none";
}
