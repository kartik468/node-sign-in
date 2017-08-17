(function() {
  'use strict';
  $( document ).ready(function() {
    $("#cognito-s3-list").on("click", function(event) {
      var jqxhr = $.post( "/cognito/getS3BucketList", function(data) {
        console.log(data);
      })
      .fail(function(err) {
        console.error(err);
      })
    });
  });
}());
