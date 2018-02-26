$(function(){
  setHeader();
});

function setHeader() {
  setTimeout(function() {
    $('.Header').addClass('Header--fixed');
    $('.Header__sns').addClass('Header__sns--fixed');
    $('.Header__title').addClass('Header__title--fixed');
  }, 1000);
}
