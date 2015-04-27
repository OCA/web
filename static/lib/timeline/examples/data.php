<?php

// in the reply we must fill in the request id that came with the request
$reqId = getReqId();

echo "
google.visualization.Query.setResponse({
  version:'0.6',
  reqId:'$reqId',
  status:'ok',
  table:{
    cols:[{id:'start',
           label:'',
           type:'datetime'},
          {id:'end',
           label:'',
           type:'datetime'},
          {id:'content',
           label:'',
           type:'string'}
         ],
    rows:[{c:[{v:new Date(2010, 7, 19)}, {v:null}, {v:'Conversation'}]},
          {c:[{v:new Date(2010, 7, 20)}, {v:null}, {v:'Official start'}]},
          {c:[{v:new Date(2010, 7, 23)}, {v:null}, {v:'Memo'}]},
          {c:[{v:new Date(2010, 8, 2, 12, 0, 0)}, {v:null}, {v:'Report'}]},
          {c:[{v:new Date(2010, 8, 6)}, {v:new Date(2010, 8, 12)}, {v:'Bla bla'}]}
         ]
  }
});
";



/**
 * Retrieve the request id from the get/post data
 * @return {number} $reqId       The request id, or 0 if not found
 */ 
function getReqId() {
  $reqId = 0;

  foreach ($_REQUEST as $req) {
    if (substr($req, 0,6) == "reqId:") {
      $reqId = substr($req, 6);
    }
  }

  return $reqId;
}


?>
