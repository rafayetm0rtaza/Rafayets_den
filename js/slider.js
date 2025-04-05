// Initialize project slider
let projectSwiper = new Swiper('.project-swiper', {
    slidesPerView: 1,
    spaceBetween: 30,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        // When window width is >= 768px
        768: {
            slidesPerView: 2,
            spaceBetween: 20
        },
        // When window width is >= 1024px
        1024: {
            slidesPerView: 3,
            spaceBetween: 30
        }
    }
});