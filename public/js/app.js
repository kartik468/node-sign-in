(function() {
  'use strict';
  $( document ).ready(function() {
    $("#cognito-s3-list").on("click", function(event) {
      var jqxhr = $.post( "/cognito/getS3BucketList", function() {
        console.log( "success" );
      })
      .fail(function() {
        console.error();( "error" );
      })
    });
  });
}());
