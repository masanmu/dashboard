(function($) {
	request_url = window.location.href.split("?")[0]+"api/ztree"
        var setting = {
            check: {
                enable: true
            },
            data: {
                simpleData: {
                    enable: true
                }
            },
	    async:{
	    	url:request_url,
		enable:true,
		type:"post",
		autoParam:["id"]
	    },
            edit: {
                enable: false
            },
	    callback:{
		onCheck:fn_list_counters
	    }
        };

	zNodes = new Array()
	$.get(request_url,function(data,status){
		ztree = JSON.parse(data)
		window.location.href
		for(i in ztree.data){
			info={
				"id":ztree.data[i][0],
				"pId":ztree.data[i][1],
				"name":ztree.data[i][2],
				"isParent":ztree.data[i][3],
			}
			zNodes.push(info)
		}
        	$(document).ready(function(){
        	   $.fn.zTree.init($("#treeDemo"), setting, zNodes);
        	});
	})
})(jQuery);
