function fn_list_counters_tags(){
    var hosts = new Array();
    $("#tbody-endpoints input:checked").each(function(i, o){
        var name = $(o).attr("data-fullname");
        hosts.push(name);
    });
    if (hosts.length === 0){
        alert("先选定一些endpoints");
        return false;
    }

    $(".loading").show();
    $.ajax({
        method: "POST",
        url: "/api/counters",
        dataType: "json",
        data: {"endpoints": JSON.stringify(hosts), "_r": Math.random()},
        success:function(ret){
            $(".loading").hide();
            if(ret.ok){
                var items = ret.data;
                // display counters
                var tbody_items = $("#counter-tag");
                tbody_items.html("");

                for (var i in items) {
                    var c = items[i];
                    var line_html =
                    + '<option value="'+c[0].split("/")[1]+'">'+ c[0].split("/")[1] + '</option>'
                    tbody_items.append($(line_html));
                }
            }else{
                alert("搜索失败：" + ret.msg);
                return false;
            }
        }
    });
}
