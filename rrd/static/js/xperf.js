function fn_list_endpoints()
{
    var qs = $.trim($("input[name='endpoint_search']").val());
    var treeobj = $.fn.zTree.getZTreeObj("treeDemo");
    if(qs.length<1){
    	treeobj.expandAll(false);
	return false
    }
    treeobj.expandAll(false);
    treeobj.refresh();
    var nodes = treeobj.getNodesByParamFuzzy("name",qs,null);
    for(var i=0;i<nodes.length;i++){
    	var res = treeobj.expandNode(nodes[i], true, false);
    }
}

function fn_list_counters(){
    var qs = $.trim($("#counter-search").val());
    var hosts = new Array();
    var treeobj = $.fn.zTree.getZTreeObj("treeDemo");
    var nodes = treeobj.getCheckedNodes(true);
    for(var i=0;i<nodes.length;i++){
    	if(nodes[i].id>99999999){
		hosts.push(nodes[i].name)
	}
    }
    if(hosts.length === 0){
    	return false
    }
    var limit = $("#counter-limit").val();
    if(qs){
   	limit = 0 
    }
    $(".loading").show();
    $.ajax({
        method: "POST",
        url: "/api/counters",
        dataType: "json",
        data: {"endpoints": JSON.stringify(hosts), "q": qs, "limit":limit, "_r": Math.random()},
        success:function(ret){
            $(".loading").hide();
            if(ret.ok){
                var items = ret.data;
		var tags = ret.tags;
                // display counters
                var tbody_items = $("#tbody-counters");
                tbody_items.html("");
		var option_tags = $("#counter-tag")
		option_tags.html("")
		var option_tags_box = $("#check-tag")
		option_tags_box.html("")
                for (var i in items) {
                    var c = items[i];
                    var display_counter_type = "计数器";
                    if(c[2] == "GAUGE") {
                        display_counter_type = "原始值";
                    }
                    var line_html = '<tr>'
                    + '<td><input type="checkbox" class="input shiftCheckbox" data-fullkey="'+c.join("?")+'"></input></td>'
                    + '<td><a href="javascript:void(0);" onclick="fn_show_chart(\'' + c.join("?") + '\')" >' + c[0]+ '</a></td>'
                    + '<td>'+ display_counter_type +'</td>'
                    + '<td>'+ c[2] +'s</td>'
                    + '</tr>'
                    tbody_items.append($(line_html));
                    tbody_items.find('.shiftCheckbox').shiftcheckbox();
                }
		
		for (var tag in tags){
			var check_box = '<label>'
			+'<div class="panel-heading">'
			+'<input type="checkbox" data-fullkey="'+tags[tag]+'">'+" "+tags[tag]+'</input>'
			+'<span class="cut-line">|</span>'
			+'</div>'
			+'</label>'
			option_tags_box.append($(check_box))
			option_tags_box.find('.shiftCheckbox').shiftcheckbox();

		}
		button='<br>'
		+'<div class="panel-heading form-group">'
		+'<button class="btn btn-default btn-sm btn-success" onclick="filter_counter();return false;">快速过滤</button>'
		+'<div class="dropdown form-group pull-right">'
		+'<a class="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown" href="#"> 看图 <span class="caret"></span></a>'
		+'<ul class="dropdown-menu" role="menu">'
		+'<li><a href="#" class="btn btn-link btn-xs" onclick="fn_show_all(\'h\');return false;">Endpoint视角</a></li>'
		+'<li><a href="#" class="btn btn-link btn-xs" onclick="fn_show_all(\'k\');return false;">Counter视角</a></li>'
		+'<li><a href="#" class="btn btn-link btn-xs" onclick="fn_show_all(\'a\');return false;">组合视角</a></li>'
		+'</ul>'
		+'</div>'
		+'</div>'
		+'</br>'
		option_tags_box.append($(button))
	    }else{
                alert("搜索失败：" + ret.msg);
                return false;
            }
        }
    });
}

function filter_endpoint()
{
    var filter_text = $("#endpoint-filter").val().toLowerCase();
    var targets = $("#tbody-endpoints tr");
    if(!filter_text){
        targets.each(function(i, obj){
            $(obj).show();
        });
    }else{
        var filter_pattern = new RegExp(filter_text, "i");

        targets.each(function(i, obj){
            var checkbox = $($(obj).find("input[type='checkbox']")[0]);
            var name = checkbox.attr("data-fullname");
            if(filter_pattern.exec(name) == null){
                $(obj).hide();
            }else{
                $(obj).show();
            }
            if($(obj).is(":visible")){
                checkbox.prop("checked", true);
            }else{
                checkbox.prop("checked", false);
            }
        });
    }
};

function filter_counter()
{
    var filter_text = $("#counter-filter").val().toLowerCase();
    var tags = new Array()
    $("#check-tag input:checked").each(function(i,o){
	var name=$(o).attr("data-fullkey")
        tags.push(name)
    })
    if(filter_text){
    	var targets = $("#check-tag label")
	var filter_pattern = new RegExp(filter_text,"i");
	$("#counter-filter").val("")
    }
    else{
	var targets = $("#tbody-counters tr")
	if(!tags){
		targets.each(function(i,obj){
		$(obj).show();
	})
	}
        var filter_pattern = new RegExp(tags.join("|"),"i")
    }
    targets.each(function(i,obj){
    	var checkbox = $($(obj).find("input[type='checkbox']")[0]);
	var name = checkbox.attr("data-fullkey");
	if(filter_pattern.exec(name) == null){
	    $(obj).hide();
	}else{
	    $(obj).show();
	}
	if($(obj).is(":visible")){
		checkbox.prop("checked",true);
	}else{
		checkbox.prop("checked",false);
	}
    });
};

function fn_show_chart(counters)
{
    var checked_hosts = new Array();
    var checked_items = new Array();

    var treeobj = $.fn.zTree.getZTreeObj("treeDemo");
    var nodes = treeobj.getCheckedNodes(true);
    for(var i=0;i<nodes.length;i++){
        if(nodes[i].id>99999999){
                checked_hosts.push(nodes[i].name)
        }
    }
    if(checked_hosts.length === 0){
	alert("先选endpoints");
	return false;
    }

    var tags = new Array();
    $("#check-tag input:checked").each(function(i,o){
        var name=$(o).attr("data-fullkey")
        tags.push(name)
    })

    counter = counters.split("?")
    if(tags.length>0){
        for(tag in tags){
                var filter_text = new RegExp(tags[tag],'i')
                if(filter_text.exec(counters) != null){
                        checked_items.push(counter[0]+"/"+tags[tag]);
                }
        }
    }
    else{
   	 if(counter[3]){
   	 	for(var i=3;i<counter.length;i++){
   	         checked_items.push(counter[0]+"/"+counter[i]);
   	     }
   	 }
   	 else{
   	 	checked_items.push(counter[0])
   	 }
    }
    if(checked_items==0){
    	alert("所选metric无对应tag")
	return false
    }
    var w = window.open();
    $.ajax({
        url: "/chart",
        dataType: "json",
        method: "POST",
        data: {"endpoints": checked_hosts, "counters": checked_items, "graph_type": "h", "_r": Math.random()},
        success: function(ret) {
            if (ret.ok) {
                setTimeout(function(){w.location="/charts?id="+ret.id+"&graph_type=h";}, 0);
            } else {
                alert("请求出错了");
            }
        },
        error: function(){
            alert("请求出错了");
        }
    });
    return false;
}

function fn_show_all(graph_type)
{
    var checked_hosts = new Array();
    var treeobj = $.fn.zTree.getZTreeObj("treeDemo");
    var nodes = treeobj.getCheckedNodes(true);
    for(var i=0;i<nodes.length;i++){
        if(nodes[i].id>99999999){
                checked_hosts.push(nodes[i].name)
        }
    }
    if(checked_hosts.length === 0){
        alert("先选endpoints");
        return false;
    }

    var checked_items = new Array();
    var tags = new Array();
    $("#check-tag input:checked").each(function(i,o){
        var name=$(o).attr("data-fullkey")
        tags.push(name)
    })
    
    if(tags.length>0){
        $("#tbody-counters input:checked").each(function(i, o){
        var key_ = $(o).attr("data-fullkey");
	counters = key_.split("?")
    	for(tag in tags){
		var filter_text = new RegExp(tags[tag],'i')
		if(filter_text.exec(key_) != null){
			checked_items.push(counters[0]+"/"+tags[tag]);
		}
	}
    })}
    else{
	$("#tbody-counters input:checked").each(function(i, o){
        var key_ = $(o).attr("data-fullkey");
        counters = key_.split("?")
	if(counters[3]){
        	for(var i=3;i<counters.length;i++)
        	{
        		checked_items.push(counters[0]+"/"+counters[i]);
        	}
	}
	else{
		checked_items.push(counters[0])
	}
    });

    }
    if (checked_items.length === 0){
        alert("请选择counter");
        return false;
    }

    var w = window.open();
    $.ajax({
        url: "/chart",
        dataType: "json",
        method: "POST",
        data: {"endpoints": checked_hosts, "counters": checked_items, "graph_type": graph_type, "_r": Math.random()},
        success: function(ret) {
            if (ret.ok) {
                setTimeout(function(){w.location="/charts?id="+ret.id+"&graph_type="+graph_type;}, 0);
            }else {
                alert("请求出错了");
            }
        },
        error: function(){
            alert("请求出错了");
        }
    });
    return false;
}

function fn_check_all_items()
{
    var box = $("#check_all_counters");
    if(box.prop("checked")){
        $("#tbody-counters").find("input:checkbox").each(function(i, o){
            $(o).prop("checked", true);
        });
    }else{
        $("#tbody-counters").find("input:checkbox").each(function(i, o){
            $(o).prop("checked", false);
        });
    }
}

function fn_check_all_hosts()
{
    var box = $("#check_all_endpoints");
    if(box.prop("checked")){
        $("#tbody-endpoints").find("input:checkbox").each(function(i, o){
            $(o).prop("checked", true);
        });
    }else{
        $("#tbody-endpoints").find("input:checkbox").each(function(i, o){
            $(o).prop("checked", false);
        });
    }
}


function fn_check_all_tags()
{
    var box = $("#check_all_tags");
    if(box.prop("checked")){
        $("#check-tag").find("input:checkbox").each(function(i, o){
            $(o).prop("checked", true);
        });
    }else{
        $("#check-tag").find("input:checkbox").each(function(i, o){
            $(o).prop("checked", false);
        });
    }
}



function fn_filter_group()
{
    var filter_text = $("#group-filter").val().toLowerCase();
    var group_objs = $(".group");
    if(!filter_text){
        group_objs.each(function(i, obj){
            $(obj).show();
        });
    }else if (filter_text.length <= 2) {
    }else{
        group_objs.each(function(i, obj){
            var groupname = $($(obj).children("a")[0]).attr("data-gname");
            if(groupname.toLowerCase().indexOf(filter_text) === -1){
                $(obj).hide();
            }else{
                $(obj).show();
            }
        });
        fn_collapse_in_groups();
    }
};

function fn_collapse_in_groups()
{
    $(".accordion-body").each(function(i, obj){
        if(!$(obj).hasClass("in")){
            $(obj).collapse("show");
        }
    });
};
