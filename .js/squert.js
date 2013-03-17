/* Copyright (C) 2013 Paul Halliday <paul.halliday@gmail.com> */

$(document).ready(function(){

    var theWhen = $("#timestamp").val();
    // Load main content
    eventList("0-aaa-00");
    $("#loader").show();

    var lastclasscount = 0;

    function d2h(d) {
       return d.toString(16);
    }

    function h2d (h) {
       return parseInt(h, 16);
    }

    function s2h (tmp) {
       var str = '', i = 0, tmp_len = tmp.length, c;
     
       for (; i < tmp_len; i += 1) {
           c = tmp.charCodeAt(i);
           str += d2h(c);
       }
       return str;
    }

    function h2s(hex) {
        var str = '';
        for (var i = 0; i < hex.length; i += 2)
            str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
        return str;
    }

    function getCountry(cc) {

        switch (cc) {
            case "LO": 
                answer = "sub_light|LO"; break;
            case "-": 
                answer = "sub_light|-"; break;
            default:
                 answer = "sub_filter|<span class=flag><img src=\".flags/" + cc + ".png\"></span>"; break;
        }

        return answer;
    }

    // Classifications
    var classifications = {"class":{  
        "c11":[{"short": "C1", "long": "Unauthorized Admin Access"}],
        "c12":[{"short": "C2", "long": "Unauthorized User Access"}],
        "c13":[{"short": "C3", "long": "Attempted Unauthorized Access"}],
        "c14":[{"short": "C4", "long": "Denial of Service Attack"}],
        "c15":[{"short": "C5", "long": "Policy Violation"}],
        "c16":[{"short": "C6", "long": "Reconnaissance"}],
        "c17":[{"short": "C7", "long": "Malware"}],
        "c2":[{"short": "ES", "long": "Escalated Event"}],
        "c1":[{"short": "NA", "long": "No Action Req'd."}],
        "c0":[{"short": "RT", "long": "Unclassified"}]
      }
    };

    function catBar(count) {
        bar =  "<div class=effs><div class=left>&nbsp;</div>";
        bar += "<div class=b_null>F1</div><div class=b_null>F2</div><div class=b_null>F3</div>";
        bar += "<div class=b_null>F4</div><div class=b_null>F5</div><div class=b_null>F6</div>";
        bar += "<div class=b_null>F7</div><div class=b_null>F8</div><div class=b_null>F9</div>";
        bar += "</div>";
        bar += "<div class=event_class>";
        bar += "<div class=left>categorize <span class=bold id=class_count>" + count + "</span> event(s):</div>";
        bar += "<div id=b_class-11 class=b_C1 title='Unauthorized Admin Access'>C1</div>";
        bar += "<div id=b_class-12 class=b_C2 title='Unauthorized User Access'>C2</div>";
        bar += "<div id=b_class-13 class=b_C3 title='Attempted Unauthorized Access'>C3</div>";
        bar += "<div id=b_class-14 class=b_C4 title='Denial of Service Attack'>C4</div>";
        bar += "<div id=b_class-15 class=b_C5 title='Policy Violation'>C5</div>";
        bar += "<div id=b_class-16 class=b_C6 title='Reconnaissance'>C6</div>";
        bar += "<div id=b_class-17 class=b_C7 title='Malware'>C7</div>";
        bar += "<div id=b_class-1  class=b_NA title='No Action Req&#x2019;d.'>NA</div>";
        bar += "<div id=b_class-2  class=b_ES title='Escalate Event'>ES</div>";
        bar += "</div>";
        return bar;
    }

    //
    // Grid
    //

    function mkGrid(values) {
        
        cells = "<table class=grid cellspacing=none><tr>";
        composite = values.split(",");
        for (var i=0; i<24;) {
            var n = i;
	    if (n < 10) {
                n = "0" + n;                
            }
            var o = 0;
            for (var c = 0; c < composite.length; ++c) {
                if (composite[c] == n)
                    o++;
            }
            if (o > 0) {
                cells += "<td class=c_on title=\"" + n + ":00 &#61;&gt; " + o + " events\">1</td>";
            } else {
                cells += "<td class=c_off>0</td>"; 
            }
            if (i == 7 || i == 15) {
                cells += "</tr><tr>";
            }
       i++; 
       }

       cells += "</tr></table>";
       return cells;
    }
 
    //
    // Filter search box
    //

    $('#clear_search').click(function() {
        if ($('#search').val() != '') {
            $('#search').val('');
            $("#b_update").click();           
        }
    });

    //
    // Event monitor
    //
 
    var emTimeout = 30000;

    var lastCount = $("#etotal").html();
    var eventCount = lastCount;

    window.setInterval(function(){

        var urArgs = "type=" + 6 + "&ts=" + theWhen;
        $(function(){
            $.get(".inc/callback.php?" + urArgs, function(data){cb(data)});
        });

        function cb(data){
            eval("theData=" + data);
            eventCount = theData[0].count;
        }

        lastCount = Number($("#etotal").html());

        if ( lastCount < eventCount ) {
            eventCount = eventCount - lastCount;
            $("#b_event").html("<b>Events:</b> " + eventCount + " new");
        }
        lastCount = eventCount;
    }, emTimeout);

    //   
    // Bottom ribbon controls
    //

    // Refresh page
    $("#b_update").click(function() {
        var cv = $('#menu1').text();
        switch (cv) {
            case "ungroup events":
                $('#tl0,#tl1').fadeOut();
                $('#tl0,#tl1').remove();
                eventList("0-aaa-00");
                $("#loader").show();
                break;
            case "regroup events":
                $('#tl3b').fadeOut();
                $('#tl3b').remove();
                eventList("2a-aaa-00");
                $("#loader").show();
                break;
        }
    });
 
    // fire refresh on enter
    $('#search').keypress(function(e) {
        if(!e) e=window.event;
        key = e.keyCode ? e.keyCode : e.which;
        if(key == 13) {
            $("#b_update").click();
        }
    });

    // Logout
    $("#logout").click(function(event) {
         $.get("index.php?id=0", function(){location.reload()});
    });

    $("#b_top").click(function() {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
    });
    
    //
    // Menu items
    //

    $(document).on("click", "#menu1", function(event) {
        var cv = $('#menu1').text();
        switch (cv) {
            case "ungroup events":
                //$('#rt').prop('checked', true);
                $('#menu1').text('regroup events');
                $('#tl0,#tl1').remove();
                eventList("2a-aaa-00");
                $("#loader").show();
                break;
            case "regroup events":
                //$('#rt').prop('checked', false);
                $('#menu1').text('ungroup events');
                $('#tl3b').remove();
                eventList("0-aaa-00"); 
                $("#loader").show();
                break;
        }
    });

    $(document).on("click", "#rt", function(event) {
        $("#b_update").click();
    });

    //
    // Tab manipulations
    //

    var tab_cached = $("#sel_tab").val();
    $('#' + tab_cached).attr('class','tab_active');
    $("#" + tab_cached + "_content").attr('class','content_active');

    $(".tab,.tab_active").mouseover(function(event) {
        $(this).css('color','#ffffff');
        $(this).css('background-color','#000000');
    });

    $(".tab,.tab_active").mouseout(function(event) {
        var curClass = $(this).attr('class');
        if ( curClass != "tab_active" ) {
            $(this).css('color','#adadad');
            $(this).css('background-color','#333333');
        }
    });

    $(".tab,.tab_active").click(function(event) {
        var active = $(".tab_active").attr('id');
        var content = $(".content_active").attr('id');

        if ( this.id != active ) {
            $("#" + active).removeClass('tab_active');
            $("#" + active).addClass('tab');
            $("#" + active).css('color','#adadad');
            $("#" + active).css('background-color','#333333');
            $(this).attr('class','tab_active');         
            $("#" + content).attr('class','content');
            $("#" + this.id + "_content").attr('class','content_active');
            activeTab = $(".tab_active").attr('id')
            $('#sel_tab').val(activeTab);
            var ctab = $('#sel_tab').val();
            var urArgs = "type=" + 5 + "&tab=" + ctab;
            $.get(".inc/callback.php?" + urArgs, function(){Null});
        }
    });

    //
    // Rows
    //

    function closeRow() {
        $("#active_eview").remove();
        $("#" + this.id).attr('class','d_row');
        $(".d_row").css('opacity','1');
        $(".d_row_active").find('[class*="row"]').css('color', 'gray');
        $(".d_row_active").find('[class*="row"]').css('background', 'transparent');
        $(".d_row_active").find('td').css('border-top', 'none')
        ltCol = $(".d_row_active").find('td.lt').html();
        $(".d_row_active").find('td.lt').css('background', ltCol);
        $(".d_row_active").attr('class','d_row');
        // update class_count
        $("#class_count").html(lastclasscount);
        $("#loader").hide();
    }

    function closeSubRow() {
        $("#eview_sub1").remove();
        $("#" + this.id).attr('class','d_row_sub');
        $(".d_row_sub").css('opacity','1');
        $(".d_row_sub_active").find('[class*="sub"]').css('color', 'gray');
        $(".d_row_sub_active").find('[class*="sub"]').css('border-top', 'none');
        $(".d_row_sub_active").find('[class*="sub"]').css('background', 'transparent');
        $(".d_row_sub_active").attr('class','d_row_sub');
        // update class_count
        $("#class_count").html(lastclasscount);
        curclasscount = lastclasscount;
        $("#loader").hide();
    }

    function closeSubRow1() {
        $("#eview_sub2").remove();
        $("#" + this.id).attr('class','d_row_sub1');
        if (!$("#eview_sub3")[0]) {
            $(".d_row_sub1").css('opacity','1');
            $(".d_row_sub1_active").find('td').css('border-top', 'none');
            $(".d_row_sub1_active").attr('class','d_row_sub1');
        }
        $("#loader").hide();
    }

    function closeSubRow2() {

        $("#eview_sub3").remove();
        $("#" + this.id).attr('class','d_row_sub1');

        if (!$("#eview_sub2")[0]) {
            $(".d_row_sub1").css('opacity','1');
            $(".d_row_sub1_active").find('td').css('border-top', 'none');
            $(".d_row_sub1_active").attr('class','d_row_sub1');
        }
        $("#loader").hide();
    }

    // Reset if headings are clicked
    $("th.sort").click(function() {
        closeRow();
    });
    
    $(document).on("click", "#ev_close", function(event) {
        closeRow();
    });

    // Close open sub views
    $(document).on("click", "#ev_close_sub", function(event) {
        closeSubRow();
    });

    // Close open packet data
    $(document).on("click", "#ev_close_sub1", function(event) {
        closeSubRow1();
    });

    // Close open packet data
    $(document).on("click", "#ev_close_sub2", function(event) {
        closeSubRow2();
    });

    //
    //  Level 1
    //

    $(document).on("click", ".row_active", function(event) {

        $("#loader").show();
        var curID = $(this).parent().attr('id');        
        // What type of row are we?
        rowType = curID.substr(0,3);

        // Make sure no other instances are open
        if (!$(".d_row_active")[0] && rowType == 'sid') {          
 
            // This leaves us with sid-gid
            rowValue = curID.replace("sid-","");
     
            // Lookup rule
            urArgs = "type=" + 4 + "&sid=" + rowValue;

            $(function(){
                $.get(".inc/callback.php?" + urArgs, function(data){cb(data)});
            });

            $(".d_row_active").attr('class', 'd_row');
            $("#active_eview").attr('class','d_row');
            
            // This is now the active row
            $("#" + curID).attr('class','d_row_active');
            $("#" + curID).find('[class*="row"]').css('border-top', '1pt solid #c9c9c9');
            // Set the class count (counted again after load)
            curclasscount = $('.d_row_active').data('event_count');

            function cb(data){
                eval("sigData=" + data);
                sigtxt = sigData.ruletxt;
                sigfile = sigData.rulefile;
                sigline = sigData.ruleline;

                var tbl = '';
                tbl += "<tr class=eview id=active_eview><td colspan=10><div id=eview class=eview>";
                tbl += "<div id=ev_close class=close><div class=b_close title='Close'>X</div></div>";
                tbl += "<div class=sigtxt>" + sigtxt + " <br><br>";
                tbl += "<span class=small>";
                tbl += "file: <span class=boldtab>" + sigfile + ":" + sigline + "</span>";
                tbl += "<canvas id=chart_timestamps width=930 height=150>[No canvas support]</canvas>";
                tbl += "</div><br>";
                tbl += catBar(curclasscount);
                tbl += "</td></tr>";
                $("#" + curID).after(tbl);
                eventList("1-" + rowValue);
                $("#eview").show();
                $(".d_row").fadeTo('0','0.2');
            }
        }
    });
 
    //
    //  Level 2
    //

    $(document).on("click", ".sub_active", function() {
        if (!$(".d_row_sub_active")[0]) {
            baseID = $(this).parent().attr('id');
            columnType = this.id[2];

            switch (columnType) {
                case "l": adqp = s2h("AND event.status = 0"); break;
                case "r": adqp = s2h("empty"); break;
            }

            rowcall = baseID.split("-");
            callerID = rowcall[0];
            $("#" + callerID).attr('class','d_row_sub_active');
            $("#" + callerID).find('td').css('border-top', '1pt solid #c9c9c9');
            $("#loader").show();
            eventList("2-" + baseID + "-" + adqp);
        }  
    });

    //
    //  Level 3 (a or b) request payload
    //
    
    $(document).on("click", ".b_PL", function() {
        if (!$("#eview_sub2")[0]) {
            baseID = $(this).data('eidl');
            rowcall = baseID.split("-");
            callerID = rowcall[0];
            $("#" + callerID).attr('class','d_row_sub1_active');
            $("#" + callerID).find('td').css('border-top', '1pt solid #c9c9c9');
            $("#loader").show();           
            eventList("3-" + baseID);
        }
    });

    //
    // Level 3 (a or b) request transcript
    //

    $(document).on("click", ".b_TX", function(event) {
        if (!$(".eview_sub3")[0]) {
            $("#loader").show();
            composite = $(this).data('tx').split("-");
            rowLoke = composite[0];
            $("#" + rowLoke).attr('class','d_row_sub1_active');
            $("#" + rowLoke).find('td').css('border-top', '1pt solid #c9c9c9');
            nCols = $("#" + rowLoke).find('td').length;
            cid = composite[1];
            txdata = composite[2];
         
            // See if a transcript is available
            urArgs = "type=" + 7 + "&txdata=" + txdata;
            $(function(){
                $.get(".inc/callback.php?" + urArgs, function(data){cb5(data)});
            });

            function cb5(data){
                eval("txRaw=" + data);
                txCMD    = txRaw.cmd;
                txResult = txRaw.tx;

                var row = '',tbl = '';
                row += "<table align=center width=100% cellpadding=0 cellspacing=0>";
                row += "<tr>";
                row += "<td class=txtext>";
                row += txResult;
                row += "</td></tr></table>";

                tbl += "<tr class=eview_sub3 id=eview_sub3><td class=sub2 colspan=" + nCols + ">";
                tbl += "<div id=ev_close_sub2 class=close_sub1>";
                tbl += "<div class=b_close title='Close'>X</div></div>";
                tbl += row;
                tbl += "</td></tr>";
                $("#" + rowLoke).after(tbl);

                // Turn off fade effect for large results
                rC = $(".d_row_sub1").length;
                if ( rC <= 399 ) {
                    $(".d_row_sub1").fadeTo('fast','0.2');
                }

                $("#loader").hide();
            }
        }
    });

    //
    // This creates the views for each level
    //

    function eventList (type) {
        var parts = type.split("-");
        var filterMsg = '';
        var rt = 0;
        var theFilter = s2h('empty');
        // Check for any filters
        if ($('#rt').is(':checked')) {
            rt = 1;
        }

        if ($('#search').val().length > 0) {
            var fParts = $('#search').val().split(" ");
            // Now see if the requested filter exists
            if ($("#tr_" + fParts[0]).length > 0) {
                tmpFilter = $("#tr_" + fParts[0]).data('filter');
                // Now see if we need to modify the query
                if(fParts[1]) { 
                    // This is the base filter
                    preFilter = h2s(tmpFilter);
                    // This is the user supplied text.
                    theQuestion = fParts[1].replace(/['@|&;*\\`]/g, "");
                    // We will accept multiple questions if they are comma delimited
                    questionParts = theQuestion.split(",");
                    if (questionParts.length > 1) {
                        var f = '(';
                        for (var i = 0; i < questionParts.length; i++) {
                            f += preFilter.replace(/\$/g, questionParts[i]);
                            if (i != (questionParts.length - 1)) {
                                f += " OR ";
                            } 
                        }
                        f += ')'; 
                        theFilter = s2h(f); 
                    } else {
                        var newFilter = preFilter.replace(/\$/g, questionParts[0]);
                        theFilter = s2h(newFilter);
                    }     
                } else {
                    theFilter = tmpFilter;
                }
            }
        }        
        switch (parts[0]) {

        // Level 0 view - Grouped by Signature
        case "0":
          urArgs = "type=" + parts[0] + "&object=" + type + "&ts=" + theWhen + "&filter=" + theFilter + "&rt=" + rt;
          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb1(data)});
          });
          function cb1(data){
              eval("d0=" + data);
              tbl = '';
              head = '';
              row = '';
              head += "<thead><tr id=trl1_headings><th class=sort width=60>QUEUED</th>";
              head += "<th class=sort width=60>ALL</th>";
              head += "<th class=sort width=35>SC</th>";
              head += "<th class=sort width=35>DC</th>";
              head += "<th class=sort width=70>ACTIVITY</th>";
              head += "<th class=sort width=80>LAST EVENT</th>";
              head += "<th class=sort>SIGNATURE</th>";
              head += "<th class=sort width=80>ID</th>";
              head += "<th class=sort width=60>PROTO</th>";
              head += "<th class=sort width=60>% TOTAL</th>";
              head += "</tr></thead>";

              var sumEC = 0, sumSC = 0, sumDC = 0, sumSI = 0;

              if (d0.length > 0) {
                  // Sums for boxes 
                  for (var i=0; i<d0.length; i++) {
                     sumEC += Number(d0[i].f1);
                     sumSC += Number(d0[i].f6);
                     sumDC += Number(d0[i].f7);
                  }
                  sumSI = d0.length;
              } else {
                  row += "<tr class=d_row><td class=row colspan=10>";
                  row += "No result.</td></tr>";
              }

              for (var i=0; i<d0.length; i++) {

                  // How many events are not categorized?
                  unClass = d0[i].f11.split(",").filter(function(x){return x==0}).length;

                  // Colour based on event presence
                  if ( unClass > 0 ) {
                      rtClass = "b_ec_hot";
                      isActive = "row_active";
                  } else {
                      rtClass = "b_ec_cold";
                      isActive = "row";
                  }

                  rid = "r" + i + "-" + parts[1];
                  cells = mkGrid(d0[i].f12);
                  row += "<tr class=d_row id=sid-" + d0[i].f3 + "-" + d0[i].f4;
                  row += " data-class=" + " data-sid=" + " data-event_count=" + d0[i].f1 + ">";
                  row += "<td class=" + isActive + "><div class=" + rtClass + ">" + unClass + "</div></td>";
                  row += "<td class=row_active><div class=b_ec_total>" + d0[i].f1 + "</div></td>";
                  row += "<td class=row><span class=red>" +d0[i].f6+ "</span></td>";
                  row += "<td class=row><span class=blue>" +d0[i].f7+ "</span></td>";

                  timeParts = d0[i].f5.split(" ");
                  timeStamp = timeParts[1];

                  row += "<td class=row>" + cells + "</td>";
                  row += "<td class=row>" + timeStamp + "</td>";
                  row += "<td class=row_filter data-type=sid data-value=";
                  row += d0[i].f3 + ">" + d0[i].f2 + "</td>";
                  row += "<td class=row>" + d0[i].f3 + "</td>";
                  row += "<td class=row>" + d0[i].f8 + "</td>";
                  
                  if( sumEC > 0) {
                      rowPer = Number(d0[i].f1/sumEC*100).toFixed(3);
                  } else {
                      rowPer = "0.000%";
                  }
   
                  row += "<td class=row><b>" + rowPer + "%</b></td>";
                  row += "</td></tr>";
              }
              
              tbl += "<table id=tl0 width=960 cellpadding=0 cellspacing=0 align=center>";
              tbl += "<td align=center><div class=big>Total Events</div><div id=etotal class=box>"; 
              tbl += sumEC + "</div></td>";
              tbl += "<td align=center><div class=big>Total Signatures</div><div class=box>";
              tbl += sumSI + "</div></td>";
              tbl += "<td align=center><div class=big>Total Sources</div><div class=box>";
              tbl += sumSC + "</div></td>";
              tbl += "<td align=center><div class=big>Total Destinations</div><div class=box>";
              tbl += sumDC + "</div></td>";
              tbl += "</table><br>";
              
              tbl += "<table id=tl1 class=main width=960 cellpadding=0 cellspacing=0 align=center>";
              tbl += head;
              tbl += row;
              tbl += "</table>";
              $('#' + parts[1] + '-' + parts[2]).after(tbl);
              $('#tl0,#tl1').fadeIn('slow');
              $("#b_event").html("<b>Events:</b>&nbsp;&nbsp;Synchronized");
              $("#tl1").tablesorter();
              if ($('#tl4').length == 0) {
                  loadFilters(0);
              }
              $("#loader").hide();
          }
        break;

        // Level 1 view - Grouped by signature, source, destination

        case "1":
          urArgs = "type=" + parts[0] + "&object=" + parts[1] + "&ts=" + theWhen + "&filter=" + theFilter + "&rt=" + rt;
          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb2(data)});
          });

          function cb2(data){
              eval("theData=" + data);
              tbl = '';
              head = '';
              row = '';
              head += "<thead><tr><th class=sub width=45>QUEUE</th>";
              head += "<th class=sub width=110>TOTAL</th>";
              head += "<th class=sub width=70>ACTIVITY</th>";
              head += "<th class=sub>LAST EVENT</th>";
              head += "<th class=sub width=110>SOURCE</th>";
              head += "<th class=sub width=160>COUNTRY</th>";
              head += "<th class=sub width=110>DESTINATION</th>";
              head += "<th class=sub width=160>COUNTRY</th>";
              head += "</tr></thead>";
              curclasscount = 0;
              timeValues = "";

              for (var i=0; i<theData.length; i++) {
                
                  var src_ip    = theData[i].src_ip  || "-";
                  var dst_ip    = theData[i].dst_ip  || "-";
                  var max_time  = theData[i].maxTime || "-";
                  var src_clong = theData[i].src_cc  || "unknown";
                  var src_cc    = theData[i].srcc    || "-";
                  var dst_clong = theData[i].dst_cc  || "unknown";
                  var dst_cc    = theData[i].dstc    || "-";
                  var cs = getCountry(src_cc).split("|");
                  if (cs[1] == "LO") { cs[1] = ""; }
                  var cd = getCountry(dst_cc).split("|");
                  if (cd[1] == "LO") { cd[1] = ""; }

                  // How many events are not categorized?
                  rt = theData[i].c_status.split(",");
                  var unclass = 0;                  
                  $.each(rt, function(a,b) {
                      switch (b) {
                          case "0": unclass++; break;
                      }
                  });
                 
                  // Colour based on event presence
                  if ( unclass > 0 ) {
                      rtClass = "b_ec_hot";
                      isActive = "sub_active";
                  } else {
                      rtClass = "b_ec_cold";
                      isActive = "sub";
                  }

                  // Aggregate time values
                  timeValues += theData[i].c_ts + ",";
                  cells = mkGrid(theData[i].f12);

                  curclasscount += parseInt(unclass);
                  rid = "r" + i + "-" + parts[1] + "-" + src_ip + "-" + dst_ip;
                  row += "<tr class=d_row_sub id=r" + i + " data-filter=\"" + rid + "\">";
                  row += "<td class=" + isActive + " id=l2l" + i + "><div class=" + rtClass + ">" + unclass + "</div></td>";
                  row += "<td class=sub_active id=l2r" + i + "><div class=b_ec_total>" + theData[i].count + "</div></td>";
                  row += "<td class=sub>" + cells + "</td>";
                  row += "<td class=sub>" + max_time + "</td>";
                  row += "<td class=sub_filter data-type=ip>" + src_ip + "</td>";
                  row += "<td class=" + cs[0] + " data-type=cc data-value=" + src_cc + ">";
                  row += cs[1] + src_clong + " (." + src_cc.toLowerCase() + ")" + "</td>";
                  row += "<td class=sub_filter data-type=ip>" + theData[i].dst_ip + "</td>";
                  row += "<td class=" + cd[0] + " data-type=cc data-value=" + dst_cc + ">";
                  row += cd[1] + dst_clong + " (." + dst_cc.toLowerCase() + ")" + "</td>";
                  row += "</tr>";
              }
              // Pass timestamps for chart creation
              chartInterval(timeValues);

              // update class_count
              $("#class_count").html(curclasscount);            
              lastclasscount = $("#class_count").html();

              tbl += "<div class=eview_sub id=eview_sub><table id=tl2 class=table cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></div>";
              $("#eview").after(tbl);
              $("#tl2").tablesorter();
              $("#loader").hide();
          }
        break;

        // Level 2 view - No grouping, individual events

        case "2":
          var rowLoke = parts[1];
          var filter = $('#' + parts[1]).data('filter');

          urArgs = "type=" + parts[0] + "&object=" + filter + "&ts=" + theWhen + "&adqp=" + parts[2];
          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb3(data)});
          });

          function cb3(data){
              eval("d2=" + data);

              tbl = '';
              head = '';
              row = '';
              head += "<thead><tr>";
              head += "<th class=sub1 width=20><input class=chk_all type=checkbox></th>";
              head += "<th class=sub1 width=20>ST</th>";
              head += "<th class=sub1 width=130>TIMESTAMP</th>";
              head += "<th class=sub1 width=100>EVENT ID</th>";
              head += "<th class=sub1 width=100>SOURCE</th>";
              head += "<th class=sub1 width=40>PORT</th>";
              head += "<th class=sub1 width=100>DESTINATION</th>";
              head += "<th class=sub1 width=40>PORT</th>";
              head += "<th class=sub1>SIGNATURE</th>";
              head += "</tr></thead>";
              
              // update class_count
              $("#class_count").html(d2.length);

              for (var i=0; i<d2.length; i++) {
                  var eclass    = d2[i].f1  || "-";
                  var timestamp = d2[i].f2  || "-";
                  var sid       = d2[i].f7  || "0";
                  var cid       = d2[i].f8  || "0"; 
                  var src_ip    = d2[i].f3  || "-";
                  var src_port  = d2[i].f4  || "-";
                  var dst_ip    = d2[i].f5  || "-";
                  var dst_port  = d2[i].f6  || "-";
                  var sig_id    = d2[i].f11 || "-";
                  var signature = d2[i].f10 || "-";
                  var txBit     = "";

                  rid = "s" + i + "-" + sid + "-" + cid;
                  eid = sid + "-" + cid;
                  row += "<tr class=d_row_sub1 id=s" + i + " data-cols=9 data-filter=\"" + eid + "\">";
                  tclass = "c" + eclass;
                  cv = classifications.class[tclass][0].short;
                  txdata = "s" + i + "-" + cid + "-" + s2h(sid + "|" + timestamp + "|" + src_ip + "|" + src_port + "|" + dst_ip + "|" + dst_port);

                  if (src_port != "-" && dst_port != "-") {
                      txBit = "<div class=b_TX data-tx=" + txdata + " title='Generate Transcript'>TX</div>";
                  }   

                  row += "<td class=row><input id=cb_" + i + " class=chk_event "; 
                  row += "type=checkbox value=\"" + eid + "\">";
                  row += "<td class=row><div class=b_" + cv + " id=class_box_" + i + ">";
                  row += cv + "</div></td>";
                  row += "<td class=sub>" + timestamp + "</td>";
                  row += "<td class=sub><div class=b_PL data-eidl=s" + i + " title=\"View Payload\">";
                  row += sid + "." + cid + "</div>" + txBit + "</td>";
                  row += "<td class=sub_filter data-type=ip>" + src_ip + "</td>";
                  row += "<td class=sub_filter data-type=spt>" + src_port + "</td>";
                  row += "<td class=sub_filter data-type=ip>" + dst_ip + "</td>";
                  row += "<td class=sub_filter data-type=dpt>" + dst_port + "</td>";
                  row += "<td class=sub_filter data-type=sid data-value= ";
                  row += sig_id + ">" + signature + "</td>";
                  row += "</td></tr>";
              }

              tbl += "<tr class=eview_sub1 id=eview_sub1><td colspan=8><div id=ev_close_sub ";
              tbl += "class=close_sub><div class=b_close title='Close'>X</div></div>";
              tbl += "<div class=notes></div>";
              tbl += "<table id=tl3 class=table align=center width=100% cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table></td></tr>";
              $("#" + rowLoke).after(tbl);
              $(".d_row_sub").fadeTo('0','0.2');
              $("#loader").hide();
              $("#tl3").tablesorter({headers:{0:{sorter:false}},cancelSelection:false});
          }
        break;
 
        // Level 2a view - No grouping, individual events

        case "2a":
          urArgs = "type=2a&ts=" + theWhen + "&filter=" + theFilter + "&rt=" + rt;
          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb3a(data)});
          });

          function cb3a(data){
              eval("d2a=" + data);

              tbl = '';
              head = '';
              row = '';
              head += "<thead><tr>";
              head += "<th class=sub width=10><input class=chk id=root_2a type=checkbox></th>";
              head += "<th class=sub width=20>ST</th>";
              head += "<th class=sub width=120>TIMESTAMP</th>";
              head += "<th class=sub width=100>ID</th>";
              head += "<th class=sub width=90>SOURCE</th>";
              head += "<th class=sub width=40>PORT</th>";
              head += "<th class=sub width=30>CC</th>";
              head += "<th class=sub width=90>DESTINATION</th>";
              head += "<th class=sub width=40>PORT</th>";
              head += "<th class=sub width=30>CC</th>";
              head += "<th class=sub>SIGNATURE</th>";
              head += "</tr></thead>";
     
              if (d2a.length == 0) {
                  row += "<tr class=d_row_sub1><td class=row colspan=11>";
                  row += "No result.</td></tr>";
              }
 
              var maxI = 3000;
              // update class_count
              $("#class_count").html(d2a.length);
              for (var i=0; i<d2a.length && i <= maxI; i++) {

                  var eclass    = d2a[i].f1  || "-"; 
                  var timestamp = d2a[i].f2  || "-";
                  var sid       = d2a[i].f11 || "0";
                  var cid       = d2a[i].f12 || "0";
                  var src_ip    = d2a[i].f3  || "-";
                  var src_port  = d2a[i].f4  || "-";
                  var src_cc    = d2a[i].f6  || "-";
                  var src_clong = d2a[i].f5  || "unknown";
                  var dst_ip    = d2a[i].f7  || "-";
                  var dst_port  = d2a[i].f8  || "-";
                  var dst_cc    = d2a[i].f10 || "-";
                  var dst_clong = d2a[i].f9  || "unknown";
                  var sig_id    = d2a[i].f15 || "-";
                  var signature = d2a[i].f14 || "-";
                  var cs = getCountry(src_cc).split("|");
                  var cd = getCountry(dst_cc).split("|");

                  rid = "s" + i + "-" + sid + "-" + cid;
                  eid = sid + "-" + cid;
                  row += "<tr class=d_row_sub1 id=s" + i + " data-cols=11 data-filter=\"" + eid + "\">";
                  tclass = "c" + eclass;
                  cv = classifications.class[tclass][0].short;
                  txdata = "s" + i + "-" + cid + "-" + s2h(sid + "|" + timestamp + "|" + src_ip + "|" + src_port + "|" + dst_ip + "|" + dst_port);

                  if (src_port != "-" && dst_port != "-") {
                      txBit = "<div class=b_TX data-tx=" + txdata + " title='Generate Transcript'>TX</div>";
                  }
   
                  row += "<td class=row><input id=eid" + i + " type=checkbox value=\"" + eid + "\">";
                  row += "<td class=row><div id=classcat data-catid=" + eid + " data-bclass=b_" + cv;
                  row += " class=b_" + cv + ">" + cv + "</div></td>";
                  row += "<td class=row>" + timestamp + "</td>";
                  row += "<td class=sub><div class=b_PL data-eidl=s" + i + " title=\"View Payload\">";
                  row += sid + "." + cid + "</div>" + txBit + "</td>";
                  row += "<td class=sub_filter data-type=ip>" + src_ip + "</td>";
                  row += "<td class=sub_filter data-type=spt>" + src_port + "</td>";
                  row += "<td class=" + cs[0] + " title=\"" + src_clong + "\" data-type=cc data-value=";
                  row += src_cc +">" + cs[1] + "</td>";
                  row += "<td class=sub_filter data-type=ip>" + dst_ip + "</td>";
                  row += "<td class=sub_filter data-type=dpt>" + dst_port + "</td>";
                  row += "<td class=" + cd[0] + " title=\"" + dst_clong + "\" data-type=cc data-value=";
                  row += dst_cc +">" + cd[1] + "</td>";
                  row += "<td class=sub_filter data-type=sid data-value=" + sig_id + ">" + signature + "</td>";
              }
 
              var sumEC = 0, sumSI = 0, sumSC = 0, sumDC = 0;
              
              if (d2a.length > 0) {
                  sumED = i; 
                  sumEC = d2a.length;
                   
              }
              tbl += "<table id=tl3b class=main align=center width=960 cellpadding=0 cellspacing=0>";
              tbl += head;
              tbl += row;
              tbl += "</table>";
              $('#' + parts[1] + '-' + parts[2]).after(tbl);
              $('#tl3b').fadeIn('slow');
              $("#b_event").html("<b>Events:</b>&nbsp;&nbsp;Synchronized");
              $("#tl3b").tablesorter({headers:{0:{sorter:false}},cancelSelection:false});
              $("#loader").hide();
          }
        break;

        // Level 3 view - Packet Data

        case "3":
          var rowLoke = parts[1];
          var nCols = $('#' + parts[1]).data('cols');
          var filter = $('#' + parts[1]).data('filter');

          urArgs = "type=" + parts[0] + "&object=" + filter + "&ts=" + theWhen;

          $(function(){
              $.get(".inc/callback.php?" + urArgs, function(data){cb4(data)});
          });

          function cb4(data){
              eval("theData=" + data);

              tbl = '';
              head = '';
              row = '';
              head += "<table align=center width=100% cellpadding=0 cellspacing=0>";
              head += "<tr>";
              head += "<th class=sub2 width=40 rowspan=2>IP</th>";
              head += "<th class=sub2>VER</th>";
              head += "<th class=sub2>IHL</th>";
              head += "<th class=sub2>TOS</th>";
              head += "<th class=sub2>LENGTH</th>";
              head += "<th class=sub2>ID</th>";
              head += "<th class=sub2>FLAGS</th>";
              head += "<th class=sub2>OFFSET</th>";
              head += "<th class=sub2>TTL</th>";
              head += "<th class=sub2>CHECKSUM</th>";
              head += "<th class=sub2>PROTO</th>";
              head += "</tr>";

              row += "<tr class=d_row_sub2>";
              row += "<td class=sub>" + theData[0].ip_ver + "</td>";
              row += "<td class=sub>" + theData[0].ip_hlen + "</td>";
              row += "<td class=sub>" + theData[0].ip_tos + "</td>";
              row += "<td class=sub>" + theData[0].ip_len + "</td>";
              row += "<td class=sub>" + theData[0].ip_id + "</td>";
              row += "<td class=sub>" + theData[0].ip_flags + "</td>";
              row += "<td class=sub>" + theData[0].ip_off + "</td>";
              row += "<td class=sub>" + theData[0].ip_ttl + "</td>";
              row += "<td class=sub>" + theData[0].ip_csum + "</td>";
              row += "<td class=sub>" + theData[0].ip_proto + "</td>";
              row += "</td></tr></table>";
              

              switch (theData[0].ip_proto) {
              
              case "1": 
                row += "<table align=center width=100% cellpadding=0 cellspacing=0>";
                row += "<tr>";
                row += "<th class=sub2 width=40 rowspan=2>ICMP</th>";
                row += "<th class=sub2 width=184>TYPE</th>";
                row += "<th class=sub2 width=184>CODE</th>";
                row += "<th class=sub2 width=184>CHECKSUM</th>";
                row += "<th class=sub2 width=184>ID</th>";
                row += "<th class=sub2 width=184>SEQ#</th>";
                row += "</tr>";
                row += "<tr class=d_row_sub2>";
                row += "<td class=sub>" + theData[1].icmp_type + "</td>";
                row += "<td class=sub>" + theData[1].icmp_code + "</td>";
                row += "<td class=sub>" + theData[1].icmp_csum + "</td>";
                row += "<td class=sub>" + theData[1].icmp_id + "</td>";
                row += "<td class=sub>" + theData[1].icmp_seq + "</td>";
                row += "</td></tr></table>";
                break;
   
              case "6":
                // TCP flags
                binFlags = Number(theData[1].tcp_flags).toString(2);
                binPad = 8 - binFlags.length;
                tcpFlags = "00000000".substring(0,binPad) + binFlags;
                
                row += "<table align=center width=100% cellpadding=0 cellspacing=0>";
                row += "<tr>";
                row += "<th class=sub2 width=40 rowspan=2>TCP</th>";
                row += "<th class=sub2 width=30>R1</th>";
                row += "<th class=sub2 width=30>R0</th>";
                row += "<th class=sub2 width=30>URG</th>";
                row += "<th class=sub2 width=30>ACK</th>";
                row += "<th class=sub2 width=30>PSH</th>";
                row += "<th class=sub2 width=30>RST</th>";
                row += "<th class=sub2 width=30>SYN</th>";
                row += "<th class=sub2 width=50>FIN</th>";
                row += "<th class=sub2>SEQ#</th>";
                row += "<th class=sub2>ACK#</th>";
                row += "<th class=sub2>OFFSET</th>";
                row += "<th class=sub2>RES</th>";
                row += "<th class=sub2>WIN</th>";
                row += "<th class=sub2>URP</th>";
                row += "<th class=sub2>CHECKSUM</th>";
                row += "</tr>";
                row += "<tr class=d_row_sub2>";
                row += "<td class=sub>" + tcpFlags[0] + "</td>";
                row += "<td class=sub>" + tcpFlags[1] + "</td>";
                row += "<td class=sub>" + tcpFlags[2] + "</td>";
                row += "<td class=sub>" + tcpFlags[3] + "</td>";
                row += "<td class=sub>" + tcpFlags[4] + "</td>";
                row += "<td class=sub>" + tcpFlags[5] + "</td>";
                row += "<td class=sub>" + tcpFlags[6] + "</td>";
                row += "<td class=sub>" + tcpFlags[7] + "</td>";
                row += "<td class=sub>" + theData[1].tcp_seq + "</td>";
                row += "<td class=sub>" + theData[1].tcp_ack + "</td>";
                row += "<td class=sub>" + theData[1].tcp_off + "</td>";
                row += "<td class=sub>" + theData[1].tcp_res + "</td>";
                row += "<td class=sub>" + theData[1].tcp_win + "</td>";
                row += "<td class=sub>" + theData[1].tcp_urp + "</td>";
                row += "<td class=sub>" + theData[1].tcp_csum + "</td>";
                row += "</td></tr></table>";
                break;
   
              case "17":
                row += "<table align=center width=100% cellpadding=0 cellspacing=0>";
                row += "<tr>";
                row += "<th class=sub2 width=40 rowspan=2>UDP</th>";
                row += "<th class=sub2 width=460>LENGTH</th>";
                row += "<th class=sub2 width=460>CHECKSUM</th>";
                row += "</tr>";
                row += "<tr class=d_row_sub2>";
                row += "<td class=sub>" + theData[1].udp_len + "</td>";
                row += "<td class=sub>" + theData[1].udp_csum + "</td>";
                row += "</td></tr></table>";               
                break;

              }
                   
              // Data
              if (!theData[2]) {
                  p_hex   = "No Data Sent.";
                  p_ascii = "No Data Sent.";
              } else {
                  p_pl = theData[2].data_payload;
                  p_length = theData[2].data_payload.length;
                  p_hex = '';
                  p_ascii = '';
                  b0 = 0;

                  for(var i=0; i < p_length; i+=2) {
                      b0++;
                      t_hex = p_pl.substr(i,2);
                      t_int = parseInt(t_hex,16);

                      if ((t_int < 32) || (t_int > 126)) {
                          p_hex   += t_hex + " ";
                          p_ascii += ".";
                      } else if (t_int == 60) {
                          p_hex += t_hex + " ";
                          p_ascii += "&lt;";
                      } else if (t_int == 62) {
                          p_hex += t_hex + " ";
                          p_ascii += "&gt;";
                      } else {
                          p_hex += t_hex + " ";
                          p_ascii += String.fromCharCode(parseInt(t_hex, 16));
                      }

                      if ((b0 == 16) && (i < p_length)) {
                          p_hex   += "<br>";
                          p_ascii += "<br>";
                          b0 = 0;
                      }

                  }
              }
              row += "<table align=center width=100% cellpadding=0 cellspacing=0>";
              row += "<tr>";
              row += "<th class=sub2 width=40 rowspan=2>DATA</th>";
              row += "<th class=sub2 width=460>HEX</th>";
              row += "<th class=sub2 width=460>ASCII</th>";
              row += "</tr>";
              row += "<tr class=d_row_sub2>";
              row += "<td class=sub><samp>" + p_hex + "</samp></td>";
              row += "<td class=sub><samp>" + p_ascii + "<samp></td>";
              row += "</td></tr></table>";
                    
              tbl += "<tr class=eview_sub2 id=eview_sub2><td class=sub2 colspan=" + nCols + "><div id=ev_close_sub1 class=close_sub1><div class=b_close title='Close'>X</div></div>";
              tbl += "<div class=notes_sub2 id=notes></div>";
              tbl += head;
              tbl += row;
              tbl += "</td></tr>";
              $("#" + rowLoke).after(tbl);
              $("#loader").hide();

              // Turn off fade effect for large results
              rC = $(".d_row_sub1").length;
              if ( rC <= 399 ) {
                  $(".d_row_sub1").fadeTo('fast','0.2');
              }
              $("#" + rowLoke).find('.getpl').html(theData[0].sid + "." + theData[0].cid);
          }
        break;
        }
    } 

    //
    // Add filter parts to box
    //

    $(document).on("click", ".sub_filter,.row_filter", function() {
        var prefix = $(this).data('type');
        var suffix = $(this).html();
        switch (prefix) {
            case  'ip': $('#search').val(prefix + " " + suffix); break;
            case  'cc': var cc = $(this).data('value');
                        $('#search').val(prefix + " " + cc); break;  
            case 'sid': var value = $(this).data('value');
                        $('#search').val(prefix + " " + value); break; 
            case 'spt': $('#search').val(prefix + " " + suffix); break;
            case 'dpt': $('#search').val(prefix + " " + suffix); break;
        } 
        $('#search').focus();
    });

    //
    // Event classification
    //

    $("#testestest").keyup(function(event){

        function stopOthers() {    
            event.preventDefault();
            event.stopPropagation();
        }

        switch (event.keyCode) {
            case 112: $('#b_class-11').click(); stopOthers(); break;
            case 113: $('#b_class-12').click(); stopOthers(); break;
            case 114: $('#b_class-13').click(); stopOthers(); break;
            case 115: $('#b_class-14').click(); stopOthers(); break;
            case 116: $('#b_class-15').click(); stopOthers(); break;
            case 117: $('#b_class-16').click(); stopOthers(); break;
            case 118: $('#b_class-17').click(); stopOthers(); break;
            case 119: $('#b_class-1').click();  stopOthers(); break;
            case 120: $('#b_class-2').click();  stopOthers(); break;
        }
    });

    // individual selects
    $(document).on("click", ".chk_event", function(event) {

       // update class_count
        $("#class_count").html($(".chk_event:checked").length);

    });

    // select all
    $(document).on("click", ".chk_all", function(event) {

       $(".chk_event").prop("checked", !$(".chk_event").prop("checked"));

       // update class_count
        $("#class_count").html($(".chk_event:checked").length);

    });

    // class button click
    $(document).on("click", "[id*=\"b_class-\"]", function() {
            eClass(this);
        
    });

    function eClass(caller) {
        curclasscount = $("#class_count").text();
        // what the new classification will be
        selClass = $(caller).attr("class");
        selTxt = selClass.split("_");
        // change visible class 
 
        $(".chk_event:checked").each(function() {
            var curID = $(this).parent(".d_row_sub1").attr('id'); 
            var n = this.id.split("_");          
            $("#class_box_" + n[1]).attr('class', selClass);
            $("#class_box_" + n[1]).text(selTxt[1]);
        });

        // uncheck everything
        $(".chk_event").prop("checked", !$(".chk_event").prop("checked"));
        $(".chk_all").prop("checked", !$(".chk_all").prop("checked"));     

        
    }

    function categorizeEvents(count) {
        ess = '';
        if ( count > 1 ) {
            ess = 's';
        }
        $("span.class_msg").text(count + " event" + ess + " successfully categorized");
        $("span.class_msg").fadeIn('slow', function() {
            setTimeout(function(){
                $(".class_msg").fadeOut('slow');
            }, 3000);
        });
    }

    //
    // Filters
    //

    // Open can close the view
    $('#filters').click(function() {
        $('#usr_filters').toggle();
        if ($('#usr_filters').css('display') == "none") {
            $('#tl4').hide();
        } else {
            $('#tl4').fadeIn();
            if ($('#tl4').length == 0) {
                loadFilters(1);
            }
        }
    }); 

    $(document).on("click", ".filter_close", function(event) {
        $('#filters').click();
    });

    // Create entries
    function mkEntry(entry) {

        cls = 'f_row';
        if(!entry) {
            cls = 'h_row';
            filter = "empty";
            entry = {"alias": "New", "name": "New Entry", "notes": "None.", "filter": filter, "age": "1970-01-01 00:00:00"};
        }

        encFilter = s2h(entry.filter);        
        row = '';
        row += "<tr class=" + cls + " id=\"tr_" + entry.alias + "\" ";
        row += "data-alias=\"" + entry.alias + "\" ";
        row += "data-name=\"" + entry.name + "\" ";
        row += "data-notes=\"" + entry.notes + "\" ";
        row += "data-filter=\"" + encFilter + "\" ";
        row += "data-global=0>";
        row += "<td class=f_row_active>" + entry.alias + "</td>";
        row += "<td class=row>" + entry.name + "</td>";
        row += "<td class=row>" + entry.notes + "</td>";
        row += "<td class=row>now</td>";
        row += "<td class=row><span id=\"" + entry.alias + "\" class=\"filter_edit\">edit</span></td>";
        row += "</tr>";
        return row;
    }

    function loadFilters(show) {
            
        var curUser = $('#t_usr').data('c_usr');
        urArgs = "type=8" + "&user=" + curUser + "&mode=query&data=0";
        $(function(){
            $.get(".inc/callback.php?" + urArgs, function(data){cb6(data)}); 
        });

        function cb6(data){
            eval("theData=" + data);
            tbl = '';
            head = '';
            row = '';
            head += "<thead><tr>";
            head += "<th class=sort width=70>ALIAS</th>";
            head += "<th class=sort width=200>NAME</th>";
            head += "<th class=sort>NOTES</th>";
            head += "<th class=sort width=150>LAST MODIFIED</th>";
            head += "<th class=sortr width=120>";
            head += "<div title=close class=filter_close>x</div>";
            head += "<div title=add class=filter_new>+</div>";
            head += "<div title=refresh class=filter_refresh>&#x21BA;</div>";
            head += "<div title=help class=filter_help>?</div>";
            head += "</th></tr></thead>";

            for (var i=0; i<theData.length; i++) {
                row += "<tr class=f_row id=\"tr_" + theData[i].alias + "\" ";
                row += "data-alias=\"" + theData[i].alias + "\" ";
                row += "data-name=\"" + theData[i].name + "\" ";
                row += "data-notes=\"" + theData[i].notes + "\" ";
                row += "data-filter=\"" + theData[i].filter + "\" ";
                row += "data-global=\"" + theData[i].global + "\">";
                row += "<td class=f_row_active>" + theData[i].alias + "</td>";
                row += "<td class=row>" + theData[i].name + "</td>";
                row += "<td class=row>" + theData[i].notes + "</td>";
                row += "<td class=row>" + theData[i].age + "</td>";
                row += "<td class=row><div id=\"" + theData[i].alias + "\" class=\"filter_edit\">edit</div></td>";
                row += "</tr>";
            }

            tbl += "<table id=tl4 class=padded width=970 cellpadding=0 cellspacing=0 align=center>";
            tbl += head;
            tbl += row;
            tbl += "</table>";
            $('#usr_filters').after(tbl);
            if (show == 1) {
                $('#tl4').fadeIn('slow');
            }
        }      
    }

    function openEdit (cl) {
        alias = $('#tr_' + cl).data('alias');
        name = $('#tr_' + cl).data('name');
        notes = $('#tr_' + cl).data('notes');
        global = $('#tr_' + cl).data('global');
        filter = h2s($('#tr_' + cl).data('filter'));
        row = '';
        row += "<tr id=filter_content>";
        row += "<td class=f_row colspan=5><textarea id=\"txt_" + alias +"\" cols=110 rows=6>";
        row += "{\n";
        row += "\"alias\": \"" + alias + "\",\n";
        row += "\"name\": \"" + name + "\",\n";
        row += "\"notes\": \"" + notes + "\",\n";
        row += "\"filter\": \"" + filter + "\"\n";
        row += "}";
        row += "</textarea>";

	// We cant remove globals
	if (global == 0) {
            row += "<div class=filter_bees><div class=filter_update>update</div><div class=filter_remove>remove</div></div>";
        }

        row += "<div class=filter_error></div>";
        row += "</td></tr>";

        $('#tr_' + cl).after(row);
    }

    // Help!?
    $(document).on("click", ".filter_help", function(event) {
        if ($('#tr_help').length == 0) {
            row = "<tr id=tr_help><td class=fhelp colspan=5>";
            row += "<div class=filter_parts><u><b>Filters</b></u><br><br>";
            row += "Filters are used to add extra conditions to base queries before they are performed. ";
            row += "When the main event page loads it displays <b>ALL</b> events for the current day. ";
            row += "Using filters lets you manipulate the base query to return just the results you are interested in. ";
            row += "Filters can either be explicit statements or shells that accept arguments.</div>";
            row += "<div class=filter_parts><u><b>Usage</b></u><br><br>";  
            row += "Once a filter has been created you can start using it right away. To do so, simply type the ";
            row += "filters alias in the input box located at the top right corner of the interface and press the ";
            row += "enter key. If you create a filter with the alias 'a', then you would ";
            row += "just type 'a' and then 'enter' to perform the query and return the filtered results.<br><br>"; 
            row += "<b>Explicit</b> filters are ";
            row += "intended to be used for frequent queries that contain multiple but static conditions, say ";
            row += "a filter called 'finance' that contains three sensors and IPs in a few  different "; 
            row += "ranges.<br><br>";
            row += "<b>Shells</b> on the other hand are a little more dynamic. For example, one of the base filters ";
            row += "with the alias 'ip' looks like this: <br><br>";
            row += "<b>\"filter\": \"(src_ip = INET_ATON('$') OR dst_ip = INET_ATON('$'))\"</b><br><br>";
            row += "This filter can be used either like this <b>'ip 10.1.2.3'</b>  or like this ";
            row += "<b>'ip 10.1.2.3,10.1.2.4,10.1.2.5'</b>. ";
            row += "Shell filters expand '$' to whatever immediately follows the filter alias. If commas are used ";
            row += "each additional item will also be added to the query.</div>";
            row += "<div class=filter_parts><u><b>Query examples</b></u><br><br>";
            row += "We are using standard MySQL vernacular so we can make use of all native functions ";
            row += "and conditional operators. A few simple examples:<br><br>";
            row += "=> (src_port NOT IN('80','443') AND dst_port > 1024)<br>";
            row += "=> (src_ip NOT BETWEEN 167772160 AND 184549375 AND src_ip NOT BETWEEN 2886729728 AND 2886795263)<br>";
            row += "=> (signature LIKE '%malware%' AND INET_ATON(dst_ip) LIKE '10.%.1.%')</div>";  
            row += "<div class=filter_parts><u><b>Available filter fields</b></u><br><br>";
            row += "<div class=filter_fields>";
            row += "<div class=boldf>cid</div> - The event ID. sid + cid = distinct event<br>";
            row += "<div class=boldf>class</div> - Event Classification<br>";
            row += "<div class=boldf>dst_ip</div> - Destination IP<br>";
            row += "<div class=boldf>dst_port</div> - Destination Port<br>";
            row += "<div class=boldf>icmp_code</div> - ICMP Code<br>";
            row += "<div class=boldf>icmp_type</div> - ICMP Type<br>";
            row += "<div class=boldf>ip_csum</div> - IP Header Checksum<br>";
            row += "<div class=boldf>ip_flags</div> - IP Flags<br>";
            row += "<div class=boldf>ip_hlen</div> - IP Header Length<br>";
            row += "<div class=boldf>ip_id</div> - IP Identification<br>";
            row += "<div class=boldf>ip_len</div> - IP Total Length<br>";
            row += "<div class=boldf>ip_off</div> - IP Fragment Offset<br>";
            row += "<div class=boldf>ip_proto</div> - IP Protocol<br>";
            row += "<div class=boldf>ip_tos</div> - IP Type Of Service</div>";
            row += "<div class=filter_fields>";
            row += "<div class=boldf>ip_ttl</div> - IP Time To Live<br>";
            row += "<div class=boldf>ip_ver</div> - IP Version<br>";
            row += "<div class=boldf>msrc.cc</div> - Source Country Code<br>";
            row += "<div class=boldf>mdst.cc</div> - Destination Country Code<br>";
            row += "<div class=boldf>priority</div> - Event Priority<br>";
            row += "<div class=boldf>sid</div> - The sensor ID. sid + cid = distinct event<br>";
            row += "<div class=boldf>signature</div> - Event Signature<br>";
            row += "<div class=boldf>signature_gen</div> - Event Signature Generator<br>";
            row += "<div class=boldf>signature_id</div> - Event Signature ID<br>";
            row += "<div class=boldf>signature_rev</div> - Event Signature Revision<br>";
            row += "<div class=boldf>src_ip</div> - Source IP<br>";
            row += "<div class=boldf>src_port</div> - Source Port<br>";
            row += "<div class=boldf>status</div> - Analyst Classification</div></div>";
            row += "</td></tr>"; 
            $('#tl4').prepend(row);
            $('.filter_help').css('background-color','#cc0000');
            $('.filter_help').css('color','#fff');
            $('.filter_help').text('X');
        } else {
            $('#tr_help').remove();
            $('.filter_help').css('background-color','#888888');
            $('.filter_help').css('color','#fff');
            $('.filter_help').text('?');
        }
    });

    // Refresh filter listing
    $(document).on("click", ".filter_refresh", function(event) {
        $('#tl4').fadeOut('slow');
        $('#tl4').remove();
        loadFilters(1);
    });

    // Create new filter
    $(document).on("click", ".filter_new", function(event) {
        // There can be only one :/  
        if ($('#tr_New').length == 0 && $('#filter_content').length == 0) {
            newEntry = mkEntry();
            if ($('#tr_help').length == 0) {
                $('#tl4').prepend(newEntry);
            } else {
                $('#tr_help').after(newEntry);
            }
        }
    });
    
    // Filter expansion (gives access to edit as well)
    $(document).on("click", ".filter_edit", function(event) {
        currentCL = $(this).attr('id');
        if (!$("#filter_content")[0]) {
            openEdit(currentCL);
            $('#' + currentCL).text('close');
            $('td:first', $(this).parents('tr')).css('background-color','#c4c4c4');
        } else {
            if($('#' + currentCL).text() == 'close') {
                $("#filter_content").remove();       
                $('#' + currentCL).text('edit');
                $('td:first', $(this).parents('tr')).css('background-color','#e9e9e9');
            }    
        }
    });

    // Update (or create new) filter
    $(document).on("click", ".filter_update", function(event) {
        // Hide any previous errors
        $('.filter_error').empty();
        eMsg = '';
        // Get the current filter
        try {
            rawTxt = $('#txt_' + currentCL).val();
            // Fitler out some stuff
            rawTxt = rawTxt.replace(/[@|&;*\\`]/g, "");
            rawTxt = rawTxt.replace(/[>]/g, "&gt;");
            rawTxt = rawTxt.replace(/[<]/g, "&lt;");
            filterTxt = $.parseJSON(rawTxt);

            // Check for empty objects
            emptyVal = 0;
            for (var i in filterTxt) {
                if (filterTxt.hasOwnProperty(i)) {
                    if (filterTxt[i].length == 0) {
                        emptyVal++;
                    }
                }
            }

            if (emptyVal > 0) throw 0; 
            
            // Sanitize alias
            var re = /^[a-zA-Z][\w-]*$/;
            var OK = re.exec(filterTxt.alias);
            if (!OK) throw 1;
            if (filterTxt.alias == "New") throw 1;

            // Make sure we dont match a builtin
            var builtins = ["c","cc","dip","dpt","ip","sid","sig","sip","spt"];
	    if (builtins.indexOf(filterTxt.alias) != -1) throw 1;

            // Continue..
            oldCL = currentCL;
            fd = s2h(filterTxt.alias + "||" + filterTxt.name + "||" + filterTxt.notes + "||" + filterTxt.filter);
            var curUser = $('#t_usr').data('c_usr');
            urArgs = "type=8&user=" + curUser + "&mode=update&data=" + fd;

            $(function(){
                $.get(".inc/callback.php?" + urArgs, function(data){cb7(data)}); 
            });

            function cb7(data){
                eval("theData=" + data);
                if (theData.msg) {
                    alert(theData.msg);
                } else {
                    $('#' + currentCL).text('edit');
                    $("#filter_content").remove();
                }         
            }

            newEntry = mkEntry(filterTxt);
            $('#' + oldCL).text('edit');
            
            // If we edited an existing entry update it.
            if (filterTxt.alias == currentCL) {
                $('#tr_' + oldCL).attr('id', 'toRemove');
                $('#toRemove').after(newEntry);
                $('#toRemove').remove();
            } else {
                $('#tr_' + oldCL).before(newEntry);
                $('td:first', $('#tr_' + oldCL)).css('background-color','#e9e9e9');
            }

            // If we started from a new entry, delete it.
            if ($('#tr_New').length == 1) {
                $('#tr_New').remove();
            }

        } catch (err) {

            switch (err) {
                case 0:
                    eMsg += "<span class=warn><br>Error!</span> ";
                    eMsg += "Please supply a value for each object.";
                    break;
                case 1:
                    eMsg += "<span class=warn><br>Error!</span> "
                    eMsg += "Filter aliases MUST be unique and start with a letter . Valid characters are: ";
                    eMsg += "Aa-Zz, 0-9, dashes and underscores.";
                    eMsg += "The word \"New\" is reserved and may not be used.";
                    break;
                default:
                    eMsg += "<span class=warn><br>Format error!</span> ";
                    eMsg += "Please ensure the format above is valid JSON. ";
                    eMsg += "I am looking for an opening curly brace <b>\"{\"</b> followed by <b>\"object\": \"value\"</b> ";
                    eMsg += "pairs.<br> Each <b>\"object\": \"value\"</b> pair terminates with a comma <b>\",\"</b> except";
                    eMsg += "the last pair before the closing curly brace <b>\"}\"</b>.";
                    eMsg += " Strings must be enclosed within double quotes";
           }
           $('.filter_error').append(eMsg);
           $('.filter_error').fadeIn();
        }
    });

    // Remove a filter
    $(document).on("click", ".filter_remove", function(event) {
        var oktoRM = confirm("Are you sure you want to remove this filter?");
        if (oktoRM) {
            var curUser = $('#t_usr').data('c_usr');
            urArgs = "type=8&user=" + curUser + "&mode=remove&data=" + currentCL;
            $(function(){
                 $.get(".inc/callback.php?" + urArgs, function(data){cb8(data)});
            }); 

            function cb8(data){
                eval("theData=" + data);
                if (theData.msg != '') {
                    alert(theData.msg);
                } else {
                    $("#filter_content").remove();
                    $("#tr_" + currentCL).fadeOut('slow', function() {
                        $("#tr_" + currentCL).remove();
                    });
                }
            }
        }
    });
// The End.

});
