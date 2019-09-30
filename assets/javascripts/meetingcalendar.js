  var start_time_clone = '';
  var end_time_clone = '';
  var start_time_clone_ill = '';
  var end_time_clone_ill = '';
  var allowEdit = false;
  var noQtip = false;
  var draggedEventIsPastDay = false;
  var maxTitleLength = 36;
  var long_time_format = 'HH:mm A';
  var long_date_format = 'MM/DD/YYYY';
  var long_date_format_datepicker = 'mm/dd/yy';
  var first_day = 0;
  var eventsJSON = [];
  var eventsJSON2 = [];
  var current_room_index = 0;
  var watch = '';
  var vi_form = false;
  var vi_form2 = false;
  var ill = false;
  var sort_uch2 = 0
  var events_bolezn=[];
  var watchers = [];
  var new_open = 0;
  jQuery(document).ready(function($) {
      if (!window.console)
          console = {
              log : function() {
              }
          };
          
      start_time_clone = $('#start_time option').clone();
      end_time_clone = $('#end_time option').clone();
      start_time_clone_ill = $('#start_time_ill option').clone();
      end_time_clone_ill = $('#end_time_ill option').clone();
           /*
      Author: shiju@qburst.com
      Description: get events in json format
      */
      getEventsJSON = function(offset) {
          var project_id = $('#project_id').val();
          var project_id_ill = this.project_id_ill;
          if (project_id == project_id_ill) {
              ill = true;
          }
          var meeting_room = $('#meeting_rooms').val();
          var meeting_room_query = '';

          if (meeting_room == 'all') {
              if (all_meeting_rooms.length > 0 && current_room_index < all_meeting_rooms.length) {
                  meeting_room_query = '';
              }
          } else {
              current_room_index = 0;
              meeting_room_query = '&cf_' + fieldIdRoom + '=' + encodeURIComponent(meeting_room);
          }
      
          var current_date = window.moment();
          current_date.subtract(14, 'days');    
          var today = current_date.format("YYYY-MM-DD");
          //  selected meeting room
          $.ajax({
              url : baseUrl + '/issues.json',
              dataType : 'json',
              data : 'key=' + api_key + '&project_id=' + project_id + meeting_room_query + '&start_date=' + encodeURIComponent('>=') + today + '&status_id=' + encodeURIComponent('*') + '&limit=' + 1000 + '&offset=' + offset,
              beforeSend : function(xhr) {
                  showSpinner();
              },
              success : function(data, textStatus, jqXHR) {
                  console.log('Get JSON success');
                  if (buildEventsJSON(data, data.offset == 0 && current_room_index == 0)) {
                      if (data.total_count > (data.offset + data.limit)) {
                          getEventsJSON(data.offset + data.limit);
                      } else {
                          if (meeting_room == 'all' && ((current_room_index > 0) && ill != true)) {
                           current_room_index = current_room_index + 1;
                              getEventsJSON(0);
                          } else {
                              current_room_index = 0;
                              $('#calendar').fullCalendar('removeEvents');
                              $('#calendar').fullCalendar('addEventSource', eventsJSON);

                              hideSpinner();
                          }
                      }
                  }
              },
               error : function(jqXHR, textStatus, errorThrown) {
                  hideSpinner();
                  alert(textStatus + ": " + errorThrown);
              }
          });
          return true;
      };
      /*
      Author: shiju@qburst.com
      Description: build events json for fullcalendar
      */

      var buildEventsJSON = function(eventsRawJSON, clear) {
          window.console.log('Building Meetings JSON');
          var count = eventsRawJSON.issues.length;
          var event = eventsRawJSON.issues;
          new_open = new_open + 1;
          if (clear) {
              eventsJSON = {events:[]};
          }
          if (new_open == 1) {
              for(var i=0; i < document.getElementById('sort_uchastniki').options.length; i++)
              {
                  if(document.getElementById('sort_uchastniki').options[i].value === $('#author_id').val()) {
                      document.getElementById('sort_uchastniki').selectedIndex = i;
                      new_open = new_open + 1;
                      break;
                  }
              }
          }
          $.ajax({
              url: baseUrl + '/users.json?limit=1000',
              dataType: 'json',
              beforeSend: function (xhr) {
                  showSpinner();
              },
              success: function (data, textStatus, jqXHR) {
                  console.log('Get Users_new');
                  var event4 = data.users;
                  var count_users = data.users.length;
                  for (var l = 0; l < count_users; l++) {
                      watchers[event4[l].id] = [event4[l].firstname + ' ' + event4[l].lastname];
                  }

              },
              async:false,
              error : function(jqXHR, textStatus, errorThrown) {
                  hideSpinner();
                  alert(textStatus + ": " + errorThrown);
              }
          });



          //  events to be rendered on fullcalendar
          // building events json for fullcalendar
          for (var i = 0; i < count; i++) {
if (event[i].project["id"] == $('#project_id').val()) {
    var eventIndexRoom = 0;
    var eventIndexStart = 1;
    var eventIndexEnd = 5;
    var eventIndexUchastniki = 6;
    if (event[i].custom_fields == undefined) {
        continue;
    }
    for (var j = 0; j < event[i].custom_fields.length; j++)
    {
        if (event[i].custom_fields[j]["id"] == fieldIdRoom)
            eventIndexRoom = j;
        if (event[i].custom_fields[j]["id"] == fieldIdStart)
            eventIndexStart = j;
        if (event[i].custom_fields[j]["id"] == fieldIdEnd)
            eventIndexEnd = j;
        if (event[i].custom_fields[j]["id"] == fieldIdUchastniki)
            eventIndexUchastniki = j;
    }

    var sort_uchastniki = $('#sort_uchastniki').val();
    var eventClassName = '';
    var event_id = event[i].id;
    var meeting_uchastniki = event[i].custom_fields[eventIndexUchastniki].value;
    var sort_uch = 0;
    watch = '';
    vi_form = false;
    for (var k = 0; k < meeting_uchastniki.length; k++)
    {
        if (meeting_uchastniki[k] == sort_uchastniki) {
            sort_uch = 1;
        }
        watch = watch + watchers[meeting_uchastniki[k]] + ', ' ;
        if ((isCurrentUserWatch(watchers[meeting_uchastniki[k]])) && !vi_form) {
            vi_form = true;
        }

    }
    watch = watch.substr(0,watch.length-2);
    var author_name = event[i].author.name;
    var start_time_arr = event[i].custom_fields[eventIndexStart].value.split(':');
    var end_time_arr = event[i].custom_fields[eventIndexEnd].value.split(':');
    var meeting_room = event[i].custom_fields[eventIndexRoom].value;
    var start_time = window.moment(event[i].start_date);
    start_time.hours(start_time_arr[0]);
    start_time.minutes(start_time_arr[1]);
    start_time.seconds(0);
    start_time.milliseconds(0);
    var end_time = window.moment(event[i].due_date);
    end_time.hours(end_time_arr[0]);
    end_time.minutes(end_time_arr[1]);
    end_time.seconds(0);
    end_time.milliseconds(0);
    var assigned_to_id = event[i].author.id;
    if (event[i].assigned_to)
        assigned_to_id = event[i].assigned_to.id;
    var assigned_to_name = event[i].author.name;
    if (event[i].assigned_to)
        assigned_to_name = event[i].assigned_to.name;
    var category_id = 0;
    var category_name = '';
    if (event[i].category) {
        category_id = event[i].category.id;
        category_name = event[i].category.name;
    }
    var title = event[i].subject;
    if (title.length >= maxTitleLength && maxTitleLength > 0) {
        title = stripSubject(title, maxTitleLength) + " ...";
    }
    eventClassName = 'category_' + category_id;
    eventClassName = eventClassName + ' tracker_status_' + event[i].status.id;
    eventClassName = eventClassName + ' meeting_room_' + getRoomClass(meeting_room);
    eventClassName = eventClassName + ' meeting_uchastniki_' + getUchastnikiClass(meeting_uchastniki);
    vi_form2 = false;
    var display = false
    if (isCurrentUser(event[i].author.id, assigned_to_id)) {
        eventClassName = eventClassName + ' myEvents ' + eventClassName;
        vi_form2 = true;
    }
    if ((sort_uchastniki=='all') || (sort_uch == 1)) {
        eventsJSON["events"].push({
            title : title,
            author : author_name,
            start : start_time,
            end : end_time,
            meeting_room : meeting_room,
            meeting_uchastniki: meeting_uchastniki,
            subject : event[i].subject,
            event_id : event_id,
            event_author_id : event[i].author.id,
            assigned_to_id : assigned_to_id,
            assigned_to_name : assigned_to_name,
            category_id: category_id,
            category_name: category_name,
            className : eventClassName,
            watch: watch,
            vi_form: vi_form,
            vi_form2: vi_form2,
            sort_uch2: sort_uch2,
            cache : true,
            ill : ill,
            displayEvent: display,
            allDay : false
        });
    }
}


          }
          return true;
      };

      var buildEventBolezn = function(eventsRawJSON) {
          window.console.log('Building Bolezn Event');
          var count = eventsRawJSON.issues.length;
          var event = eventsRawJSON.issues;
         eventsJSON2 = {events:[]};

          //  events to be rendered on fullcalendar
          // building events json for fullcalendar
          for (var i = 0; i < count; i++) {
              var eventIndexRoom = 0;
              var eventIndexStart = 1;
              var eventIndexEnd = 5;
              var eventIndexUchastniki = 6;
              if (event[i].custom_fields == undefined) {
                  continue;
              }
              for (var j = 0; j < event[i].custom_fields.length; j++)
              {
                  if (event[i].custom_fields[j]["id"] == fieldIdRoom)
                      eventIndexRoom = j;
                  if (event[i].custom_fields[j]["id"] == fieldIdStart)
                      eventIndexStart = j;
                  if (event[i].custom_fields[j]["id"] == fieldIdEnd)
                      eventIndexEnd = j;
                  if (event[i].custom_fields[j]["id"] == fieldIdUchastniki)
                      eventIndexUchastniki = j;
              }
              var sort_uchastniki = $('#sort_uchastniki').val();
              var eventClassName = '';
              var event_id = event[i].id;
              var meeting_uchastniki = event[i].custom_fields[eventIndexUchastniki].value;
              var sort_uch = 0;
              watch = '';
              vi_form = false;
              var author_name = event[i].author.name;
              var start_time_arr = event[i].custom_fields[eventIndexStart].value.split(':');
              var end_time_arr = event[i].custom_fields[eventIndexEnd].value.split(':');
              var meeting_room = event[i].custom_fields[eventIndexRoom].value;
              var start_time = window.moment(event[i].start_date);
              start_time.hours(start_time_arr[0]);
              start_time.minutes(start_time_arr[1]);
              start_time.seconds(0);
              start_time.milliseconds(0);
              var end_time = window.moment(event[i].due_date);
              end_time.hours(end_time_arr[0]);
              end_time.minutes(end_time_arr[1]);
              end_time.seconds(0);
              end_time.milliseconds(0);
              var assigned_to_id = event[i].author.id;
              if (event[i].assigned_to)
                  assigned_to_id = event[i].assigned_to.id;
              var assigned_to_name = event[i].author.name;
              if (event[i].assigned_to)
                  assigned_to_name = event[i].assigned_to.name;
              var category_id = 0;
              var category_name = '';
              if (event[i].category) {
                  category_id = event[i].category.id;
                  category_name = event[i].category.name;
              }
              var title = event[i].subject;
              if (title.length >= maxTitleLength && maxTitleLength > 0) {
                  title = stripSubject(title, maxTitleLength) + " ...";
              }
              eventClassName = 'category_' + category_id;
              eventClassName = eventClassName + ' tracker_status_' + event[i].status.id;
              eventClassName = eventClassName + ' meeting_room_' + getRoomClass(meeting_room);
              eventClassName = eventClassName + ' meeting_uchastniki_' + getUchastnikiClass(meeting_uchastniki);
              vi_form2 = false;
              var display = false
              if (isCurrentUser(event[i].author.id, assigned_to_id)) {
                  eventClassName = eventClassName + ' myEvents ' + eventClassName;
                  vi_form2 = true;
              }
             eventsJSON2["events"].push({
                      title : title,
                      author : author_name,
                      start : start_time,
                      end : end_time,
                      meeting_room : meeting_room,
                      meeting_uchastniki: meeting_uchastniki,
                      subject : event[i].subject,
                      event_id : event_id,
                      event_author_id : event[i].author.id,
                      assigned_to_id : assigned_to_id,
                      assigned_to_name : assigned_to_name,
                      category_id: category_id,
                      category_name: category_name,
                      className : eventClassName,
                      watch: watch,
                      vi_form: vi_form,
                      vi_form2: vi_form2,
                      sort_uch2: sort_uch2,
                      cache : true,
                      ill : ill,
                      displayEvent: display,
                      allDay : false
                  });
                                 }
          return true;
      };
      var getRoomClass = function(meeting_room) {
          var index = all_meeting_rooms.indexOf(meeting_room);
          if (index >= 0) {
              return index + 1;
          }
          
          return 0;
      };
      var getUchastnikiClass = function(meeting_uchastniki) {
          var index = all_meeting_uchastniki.indexOf(meeting_uchastniki);
          if (index >= 0) {
              return index + 1;
          }

          return 0;
      };
      /*
      Author: shiju@qburst.com
      Description: checking whether event overlaps with exisiting events
      */

      var isOverlapping = function(event_id, meeting_room, eventStart, eventEnd, periodtype, period) {
            if ((allow_overlap == 1) || (ill)) {
            return false;
        }

            var events = $('#calendar').fullCalendar('clientEvents');
            if (events.length == 0) {
                return false;
            }

            var start = eventStart.clone();
            var end = eventEnd.clone();

            if (periodtype <= 0 || period <= 0) {
                periodtype = 1;
                period = 1;
            }

            var overlapping = false;

            if (periodtype = 1 && period > 1) {
                if (end.isAfter(start.clone().add(1, 'days'))) {
                    overlapping = true;
                }
            }

            while (period > 0 && !overlapping) {
                if ((start.isoWeekday() == 6 || start.isoWeekday() == 7) && !allow_weekends) {
                    continue;
                }

                for (i in events) {
                    if (event_id != 0 && events[i].event_id == event_id) {
                        continue;
                    }

                    if (meeting_room != events[i].meeting_room) {
                        continue;
                    }
                    /*
                    if (meeting_uchastniki != events[i].meeting_uchastniki) {
                        continue;
                    }
                     */


                    if (events[i].start == undefined || events[i].end == undefined) {
                        continue;
                    }

                    // start is the same
                    if (start.isSame(events[i].start, 'minutes')) {
                        overlapping = true;
                    // end is the same
                    } else if (end.isSame(events[i].end, 'minutes')) {
                        overlapping = true;
                    // start is before start and end is after end
                    } else if (start.isBefore(events[i].start, 'minutes') && end.isAfter(events[i].end, 'minutes')) {
                        overlapping = true;
                    // start is between start and end (exclusive)
                    } else if (start.isBetween(events[i].start, events[i].end, 'minutes')) {
                        overlapping = true;
                    // end is between start and end (exclusive)
                    } else if (end.isBetween(events[i].start, events[i].end, 'minutes')) {
                        overlapping = true;
                    }

                    if (overlapping == true) {
                        break;
                    }
                }

                start.add(periodtype, 'days');
                end.add(periodtype, 'days');
                period--;
            }

            return overlapping;
        };

      var isOverlapping_uchastniki = function(event_id, meeting_room, eventStart, eventEnd, periodtype, period, uchastniki) {
          if ((allow_overlap == 1) || (ill)) {
              return false;
          }

          var events = $('#calendar').fullCalendar('clientEvents');
          if (events.length == 0) {
              return false;
          }

          var start = eventStart.clone();
          var end = eventEnd.clone();

          if (periodtype <= 0 || period <= 0) {
              periodtype = 1;
              period = 1;
          }

          var overlapping = false;

          if (periodtype = 1 && period > 1) {
              if (end.isAfter(start.clone().add(1, 'days'))) {
                  overlapping = true;
              }
          }

          while (period > 0 && !overlapping) {

              for (i in events) {
                  if (event_id != 0 && events[i].event_id == event_id) {
                      continue;
                  }

                  if (meeting_room == events[i].meeting_room) {
                      continue;
                  } else if (meeting_room != events[i].meeting_room) {
                      if (start.isSame(events[i].start, 'minutes')) {
                          for (var j = 0; j < events[i].meeting_uchastniki.length; j++)
                          {
                              for (var k = 0; k < uchastniki.length; k++)
                              {
                                  if (events[i].meeting_uchastniki[j] == uchastniki[k])
                                      overlapping = true;
                              }
                          }
                          // end is the same
                      } else if (end.isSame(events[i].end, 'minutes')) {
                          for (var j = 0; j < events[i].meeting_uchastniki.length; j++)
                          {
                              for (var k = 0; k < uchastniki.length; k++)
                              {
                                  if (events[i].meeting_uchastniki[j] == uchastniki[k])
                                      overlapping = true;
                              }
                          }
                          // start is before start and end is after end
                      } else if (start.isBefore(events[i].start, 'minutes') && end.isAfter(events[i].end, 'minutes')) {
                          for (var j = 0; j < events[i].meeting_uchastniki.length; j++)
                          {
                              for (var k = 0; k < uchastniki.length; k++)
                              {
                                  if (events[i].meeting_uchastniki[j] == uchastniki[k])
                                      overlapping = true;
                              }
                          }
                          // start is between start and end (exclusive)
                      } else if (start.isBetween(events[i].start, events[i].end, 'minutes')) {
                          for (var j = 0; j < events[i].meeting_uchastniki.length; j++)
                          {
                              for (var k = 0; k < uchastniki.length; k++)
                              {
                                  if (events[i].meeting_uchastniki[j] == uchastniki[k])
                                      overlapping = true;
                              }
                          }
                          // end is between start and end (exclusive)
                      } else if (end.isBetween(events[i].start, events[i].end, 'minutes')) {
                          for (var j = 0; j < events[i].meeting_uchastniki.length; j++)
                          {
                              for (var k = 0; k < uchastniki.length; k++)
                              {
                                  if (events[i].meeting_uchastniki[j] == uchastniki[k])
                                      overlapping = true;
                              }
                          }
                      }

                  }
                  if (events[i].start == undefined || events[i].end == undefined) {
                      continue;
                  }

                  // start is the same


                  if (overlapping == true) {
                      break;
                  }
              }

              start.add(periodtype, 'days');
              end.add(periodtype, 'days');
              period--;
          }

          return overlapping;
      };

      var isOverlapping_bolezn = function(event_id, meeting_room, eventStart, eventEnd, periodtype, period, uchastniki) {
          if ((allow_overlap == 1) || (ill)) {
              return false;
          }
          var current_date2 = window.moment();
          current_date2.subtract(31, 'days');
          var today2 = current_date2.format("YYYY-MM-DD");
          $.ajax({
              url : baseUrl + '/issues.json',
              dataType : 'json',
              data : 'key=' + api_key + '&project_id=' + project_id_ill + '&start_date=' + encodeURIComponent('>=') + today2 + '&status_id=' + encodeURIComponent('*') + '&limit=' + 500,
              beforeSend: function (xhr) {
                  showSpinner();
              },
              success: function (data, textStatus, jqXHR) {
                  console.log('Get project ILL success');
                  events_bolezn = buildEventBolezn(data);
                               },
              async:false,
              error : function(jqXHR, textStatus, errorThrown) {
                  hideSpinner();
                  alert(textStatus + ": " + errorThrown);
              }
          });

          var events = eventsJSON2;
          if (events.length == 0) {
              return false;
          }

          var start = eventStart.clone();
          var end = eventEnd.clone();

          if (periodtype <= 0 || period <= 0) {
              periodtype = 1;
              period = 1;
          }

          var overlapping = false;

          if (periodtype = 1 && period > 1) {
              if (end.isAfter(start.clone().add(1, 'days'))) {
                  overlapping = true;
              }
          }

          while (period > 0 && !overlapping) {

              for (i in events) {
                  if (meeting_room != events[i].meeting_room) {
                      if (start.isSame(events[i].start, 'minutes')) {
                          for (var j = 0; j < events[i].meeting_uchastniki.length; j++)
                          {
                              for (var k = 0; k < uchastniki.length; k++)
                              {
                                  if (events[i].meeting_uchastniki[j] == uchastniki[k])
                                      overlapping = true;
                              }
                          }
                          // end is the same
                      } else if (end.isSame(events[i].end, 'minutes')) {
                          for (var j = 0; j < events[i].meeting_uchastniki.length; j++)
                          {
                              for (var k = 0; k < uchastniki.length; k++)
                              {
                                  if (events[i].meeting_uchastniki[j] == uchastniki[k])
                                      overlapping = true;
                              }
                          }
                          // start is before start and end is after end
                      } else if (start.isBefore(events[i].start, 'minutes') && end.isAfter(events[i].end, 'minutes')) {
                          for (var j = 0; j < events[i].meeting_uchastniki.length; j++)
                          {
                              for (var k = 0; k < uchastniki.length; k++)
                              {
                                  if (events[i].meeting_uchastniki[j] == uchastniki[k])
                                      overlapping = true;
                              }
                          }
                          // start is between start and end (exclusive)
                      } else if (start.isBetween(events[i].start, events[i].end, 'minutes')) {
                          for (var j = 0; j < events[i].meeting_uchastniki.length; j++)
                          {
                              for (var k = 0; k < uchastniki.length; k++)
                              {
                                  if (events[i].meeting_uchastniki[j] == uchastniki[k])
                                      overlapping = true;
                              }
                          }
                          // end is between start and end (exclusive)
                      } else if (end.isBetween(events[i].start, events[i].end, 'minutes')) {
                          for (var j = 0; j < events[i].meeting_uchastniki.length; j++)
                          {
                              for (var k = 0; k < uchastniki.length; k++)
                              {
                                  if (events[i].meeting_uchastniki[j] == uchastniki[k])
                                      overlapping = true;
                              }
                          }
                      }

                  }
                  if (events[i].start == undefined || events[i].end == undefined) {
                      continue;
                  }

                  // start is the same


                  if (overlapping == true) {
                      break;
                  }
              }

              start.add(periodtype, 'days');
              end.add(periodtype, 'days');
              period--;
          }

          return overlapping;
      };
        /*
        Author: shiju@qburst.com
        Description: stripping the subject text to fit into the calendar event and tooltip
        */
      var stripSubject = function(eventsub, limit) {
          var strlen = eventsub.length;
          if (strlen > limit) {
              return eventsub.substr(0, limit); //.repl;
          } else {
              return eventsub;
          }
      };
      /*
      Author: shiju@qburst.com
      Description: checking whether the current user is same as the author of event
      */
      var isCurrentUser = function(event_author_id, event_assigned_to_id) {
          var current_user_id = $('#author_id').val();
          if ((event_author_id == current_user_id) || (event_assigned_to_id == current_user_id) || (user_is_manager == 1)) {
              return true;
          }
          return false;
      };
      var isCurrentUserWatch = function(event_watch_id) {
          var current_user_id = $('#user_name').val();
          if (event_watch_id == current_user_id) {
              return true;
          }
          return false;
      };
      /*
      Author: shiju@qburst.com
      Description: checking whether the event start date is past today
      */
      var isPastDay = function(calDate) {
          var current_date = window.moment();
          if (calDate.isBefore(current_date, 'minutes')) {
              if (allow_changing_old_meetings == 1 || ill) {
                  return false;
              }
              return false;
          } else {
              return false;
          }
      };
      /*
      Author: shiju@qburst.com
      Description: intialising fullcalendar to render events
      */
      var loadCalendar = function() {          
          var disableDragAndDrop = true;
          if (allow_drag_and_drop == 1)
              disableDragAndDrop = false;
              
          var disableResize = true;
          if (allow_resize == 1)
              disableResize = false;
        
          current_room_index = 0;
          if (!getEventsJSON(0)) {
              console.log('Failed loading Meeting Calendar');
              return;
          }

          console.log('Loading Meeting Calendar');
          $('#calendar').fullCalendar({
              lang: current_lang,
              height: 'auto',
              contentHeight: 'auto',
              allDaySlot : false,
              weekends : allow_weekends == 1,
              firstDay: first_day,
              slotEventOverlap : false,
              header : {
                  left : 'today prev next',
                  center : 'title',
                  right : 'month,agendaWeek,agendaDay'
              },
              defaultView : 'agendaWeek',
              editable : true,
              eventStartEditable: !disableDragAndDrop,
              eventDurationEditable: !disableResize,
              minTime : datetime_min,
              maxTime : datetime_max,
              timeFormat: long_time_format.replace(/HH/g, 'H').replace(/:mm/g, '(:mm)').replace(/ A/g, 't'),
              axisFormat: long_time_format.replace(/HH/g, 'H').replace(/:mm/g, '(:mm)').replace(/ A/g, 't'),
              eventRender : function(event, element)
              {

                  if (event.ill != true)
                  {
                                             var full_text = '<p>';
                          if ((event.vi_form) || (event.vi_form2)) {
                              full_text = full_text + '<b>' + 'Тема' + ': ' + '</b>' + event.title + '<br/>';
                              if (show_ticket_id == '1') {
                                  full_text = full_text + '<a href="' + baseUrl + '/issues/' + event.event_id + '/edit' + '">' + '<b>' + tracker_name + ' #' + event.event_id + '</b>' + '</a>'  + '<br/>';
                              }
                              full_text = full_text + '<b>' + langRoom + ': ' + '</b>' + event.meeting_room + '<br/>';
                              full_text = full_text + '<b>' + langBookedBy + ': ' + '</b>' + event.author + '<br/>';
                              full_text = full_text + '<b>' + langStartTime + ': ' + '</b>' + event.start.format(long_time_format) + '<br/>';
                              full_text = full_text + '<b>' + langEndTime + ': ' + '</b>' + event.end.format(long_time_format) + '<br/>';

                              full_text = full_text + '<b>' + 'Участники: ' + '</b>' + event.watch;
                              /*
                               full_text = full_text + 'Участники' + ': ' + event.meeting_uchastniki + '<br/>';
                                 */
                              if (show_categories == '1') {
                                  full_text = full_text + '<br/>' + langCategory + ': ' + event.category_name;
                              }

                          }
                          else {
                              full_text = full_text + '<b>' + langBookedBy + ': ' + '</b>' + event.author + '<br />';
                              full_text = full_text + '<b>' + langRoom + ': ' + '</b>' + event.meeting_room + '<br />';
                          }
                          full_text = full_text + '</p>';
                          element.qtip({
                              content : {
                                  // Set the text and title fot the tooltip
                                  text : full_text,
                                  title : {
                                      text : event.subject // Give the tooltip a title using each elements text
                                  }
                              },
                              position : {
                                  my : 'bottom center',
                                  at: 'top center',
                                  target: element,
                                  viewport: true,
                                  adjust : {
                                      method : 'flip' // Keep the tooltip on-screen at all times
                                  }
                              },
                              show : {
                                  when : 'mouseover',
                                  solo : true // Only show one tooltip at a time
                              },
                              hide : {
                                  when : 'mouseout',
                                  fixed : true // Don't hide tooltip on mouse over
                              },
                              style : {
                                  tip : {
                                      corner: true
                                  }, // Apply a speech bubble tip to the tooltip at the designated tooltip corner
                                  width : 330, // Set the tooltip width
                                  widget: true,
                                  def: false,
                              },
                              events: {
                                  show: function(event, api) {
                                      if (noQtip) {
                                          event.preventDefault();
                                      }
                                  }
                              }
                          });
                      }

                  else
                      {
                          var full_text = '<p>';
                          full_text = full_text + '<b>' + 'Сотрудник: ' + '</b>' + event.watch + '<br/>';
                          full_text = full_text + '<b>' + langStartTime + ': ' + '</b>' + event.start.format(long_time_format) + '<br/>';
                          full_text = full_text + '<b>' + langEndTime + ': ' + '</b>' + event.end.format(long_time_format) + '<br/>';
                          full_text = full_text + '</p>';
                          element.qtip({
                              content : {
                                  // Set the text and title fot the tooltip
                                  text : full_text,
                                  title : {
                                      text : event.subject // Give the tooltip a title using each elements text
                                  }
                              },
                              position : {
                                  my : 'bottom center',
                                  at: 'top center',
                                  target: element,
                                  viewport: true,
                                  adjust : {
                                      method : 'flip' // Keep the tooltip on-screen at all times
                                  }
                              },
                              show : {
                                  when : 'mouseover',
                                  solo : true // Only show one tooltip at a time
                              },
                              hide : {
                                  when : 'mouseout',
                                  fixed : true // Don't hide tooltip on mouse over
                              },
                              style : {
                                  tip : {
                                      corner: true
                                  }, // Apply a speech bubble tip to the tooltip at the designated tooltip corner
                                  width : 330, // Set the tooltip width
                                  widget: true,
                                  def: false,
                              },
                              events: {
                                  show: function(event, api) {
                                      if (noQtip) {
                                          event.preventDefault();
                                      }
                                  }
                              }
                          });
                  }


              },
              eventClick : function(calEvent, jsEvent, view) {
                  if ("Anonymous" == $('#user_name').val() || "Anonym" == $('#user_name').val()) {
                      console.log('User not logged in');
                      return false;
                  }
                  
                  if (!user_can_edit) {
                      console.log('User cannot edit tickets of project');
                      return false;
                  }
                  
                  if (!allowEdit) {
                      console.log('Loading not finished');
                      return false;
                  }
                  
                  if (isPastDay(calEvent.end)) {
                      jAlert(langWarningEditPast, langInfo);
                      return false;
                  }

                  var event_author_id = calEvent.event_author_id;
                  if (!(isCurrentUser(event_author_id, calEvent.assigned_to_id))) {
                      console.log('It is an event created by another user');
                      return false;
                  }
                         window.location = baseUrl + '/issues/' + calEvent.event_id;
                  /*
                         $('input:checkbox').removeAttr('checked');
                         $('#selected_meeting_room').val(calEvent.meeting_room);

                  if ($('#meeting_rooms').val() == 'all' && !hide_rooms) {
                      $('#selected_meeting_room_container').show();
                  } else {
                      $('#selected_meeting_room_container').hide();
                  }
                  if ($('#sort_uchastniki').val() != 'all') {
                      $('#sort_uchastniki').prop('selectedIndex', 0);
                      reloadCalendar();
                                      }
                         $('#meeting_date').val(calEvent.start.format(long_date_format));
                         $('#meeting_end_date').val(calEvent.end.format(long_date_format));
                         $('#meeting_date_ill').val(calEvent.start.format(long_date_format));
                         $('#meeting_end_date_ill').val(calEvent.end.format(long_date_format));
                         $('#subject').val(calEvent.subject);
                         $('#subject_ill').val(calEvent.subject);
                         $('#event_id').val(calEvent.event_id);
                         $('#start_time').val(calEvent.start.format('HH:mm'));
                         $('#start_time_ill').val(calEvent.start.format('HH:mm'));
                         setEndTime();
                         $('#end_time_ill').val(calEvent.end.format('HH:mm'));
                            $('#end_time').val(calEvent.end.format('HH:mm'));
                         $('#assigned_to_id').val(calEvent.assigned_to_id);
                         $('#category_id').val(calEvent.category_id);
                         $('#selected_meeting_uchastniki_ill').val(calEvent.meeting_uchastniki);
                         if (ill) {
                             $('.saveillModal').dialog({
                                 title : langUpdateEvent,
                                 modal : true,
                                 resizable : false,
                                 draggable : true,
                                 width : 450,
                                 show : 'blind',
                                 hide : 'explode'
                             });
                             $('.saveillModal').dialog('open');
                             $('.recurfield').hide();
                             $('#recur_div').hide();
                             if (user_can_delete) {
                                 $('#delete_meeting').show();
                             } else {
                                 $('#delete_meeting').hide();
                             }
                             $('#subject').focus();
                         }
                         else {
                             $('.saveMeetingModal').dialog({
                                 title : langUpdateEvent,
                                 modal : true,
                                 resizable : false,
                                 draggable : true,
                                 width : 450,
                                 show : 'blind',
                                 hide : 'explode'
                             });
                             $('.saveMeetingModal').dialog('open');
                             $('.recurfield').hide();
                             $('#recur_div').hide();
                             if (user_can_delete) {
                                 $('#delete_meeting').show();
                             } else {
                                 $('#delete_meeting').hide();
                             }
                             $('#subject').focus();
                         }
*/
              },
              dayClick : function(date, jsEvent, calEvent) {
                  if ("Anonymous" == $('#user_name').val() || "Anonym" == $('#user_name').val()) {
                      console.log('User not logged in');
                      return false;
                  }
                  
                  if (!user_can_add) {
                      console.log('User cannot add tickets to project');
                      return false;
                  }
                  
                  if (!allowEdit) {
                      console.log('Loading not finished');
                      return false;
                  }

                  if (isPastDay(date)) {
                      jAlert(langWarningCreatePast, langInfo);
                      return false;
                  } 
                  
                  // clear field values
                  $('#event_id').val(0);
                  if ($('#meeting_rooms').val() == 'all' && !hide_rooms) {
                      $('#selected_meeting_room').prop('selectedIndex', 1);
                      $('#selected_meeting_room_container').show();
                  } else {
                      $('#selected_meeting_room').val($('#meeting_rooms').val());
                      $('#selected_meeting_room_container').hide();
                  }
                    window.location = baseUrl + '/projects/' + $('#project_id').val() +  '/issues/new';
                    /*
                  $('#meeting_date').val(date.format(long_date_format));
                  $('#meeting_end_date').val(date.format(long_date_format));
                  $('#meeting_date_ill').val(date.format(long_date_format));
                  $('#meeting_end_date_ill').val(date.format(long_date_format));
                  $('#subject').val(user_last_name);
                  $('#subject_ill').val(user_last_name);
                  $('#start_time').val('');
                  $('#end_time').val('');
                  $('#start_time_ill').val('');
                  $('#end_time_ill').val('');
                  $('input:checkbox').removeAttr('checked');
                  $('#start_time').val(date.format('HH:mm'));
                  $('#start_time_ill').val(date.format('HH:mm'));
                  $('#assigned_to_id').val($('#author_id').val());                          
                  $('#category_id').val(0);
                  if (ill) {
                      $('.saveillModal').dialog({
                          title : langCreateIll,
                          modal : true,
                          resizable : false,
                          draggable : true,
                          width : 450,
                          show : 'blind',
                          hide : 'explode'
                      });
                      $('.saveillModal').dialog('open');
                      $('.recurfield').show();
                      $('#recur_div').hide();
                      $('#delete_meeting').hide();
                      $('#subject').focus();
                      setEndTime_ill();
                  }
                  else {
                      $('.saveMeetingModal').dialog({
                          title : langCreateEvent,
                          modal : true,
                          resizable : false,
                          draggable : true,
                          width : 450,
                          show : 'blind',
                          hide : 'explode'
                      });
                      $('.saveMeetingModal').dialog('open');
                      $('.recurfield').show();
                      $('#recur_div').hide();
                      $('#delete_meeting').hide();
                      $('#subject').focus();
                      setEndTime();
                  }
*/
              },
              eventOverlap: function(stillEvent, movingEvent) {
		  if ((allow_overlap == 1) || (ill)) {
		      return true;
		  }
                  return stillEvent.meeting_room != movingEvent.meeting_room;
              },
              eventDragStart: function( event, jsEvent, ui, view ) {
                  noQtip = true; 
                  return true; 
              },
              eventDragStop: function( event, jsEvent, ui, view )
              {
                  noQtip = false;
                  if (isPastDay(event.start)) {
                      draggedEventIsPastDay = true;
                      return false;
                  }
                  draggedEventIsPastDay = false;
                  return true;
              },
              eventDrop: quickEditEvent,
              eventResizeStart: function( event, jsEvent, ui, view ) {
                  noQtip = true; 
                  return true; 
              },
              eventResizeStop: function( event, jsEvent, ui, view )
              {
                  noQtip = false;
                  if (isPastDay(event.start)) {
                      draggedEventIsPastDay = true;
                      return false;
                  }
                  draggedEventIsPastDay = false;
                  return true;
              },
              eventResize: quickEditEvent
          });
      };
      
      $('#recurCheckbox').click(function() {
          showHiderecurdiv();
      });

      var quickEditEvent = function( event, delta, revertFunc, jsEvent, ui, view )
      {
          if (!event.start.hasTime()) {
              if (revertFunc != null) {
                  revertFunc();
              }
              return false;
          }
          
          if ("Anonymous" == $('#user_name').val() || "Anonym" == $('#user_name').val()) {
              console.log('User not logged in');              
              if (revertFunc != null) {
                  revertFunc();
              }
              return false;
          }          
          
                  
          if (!user_can_edit) {
              console.log('User cannot edit tickets of project');
              if (revertFunc != null) {
                  revertFunc();
              }
              return false;
          }
          
          if (!(isCurrentUser(event.event_author_id, event.assigned_to_id))) {
              console.log('It is an event created by another user');
              if (revertFunc != null) {
                  revertFunc();
              }
              return false;
          }
          
          if (!allow_multiple_days && !event.start.isSame(event.end, 'days')) {
              console.log('Multiple day event is forbidden');
              if (revertFunc != null) {
                  revertFunc();
              }
              return false;
          }
          

          if (isPastDay(event.start) || draggedEventIsPastDay) {
              if (revertFunc != null) {
                  revertFunc();
              }
              jAlert(langWarningEditPast, langInfo);
              return false;
          } 
          
          if (isOverlapping(event.event_id, event.meeting_room, event.start, event.end, 0, 0)) {
              console.log('Overlapping');
              if (revertFunc != null) {
                  revertFunc();
              }
              return false;
          }
          if (isOverlapping_uchastniki(event.event_id, event.meeting_room, event.start, event.end, 0, 0, event.meeting_uchastniki)) {
              console.log('Overlapping');
              if (revertFunc != null) {
                  revertFunc();
              }
              return false;
          }
          if (isOverlapping_bolezn(event.event_id, event.meeting_room, event.start, event.end, 0, 0, event.meeting_uchastniki)) {
              console.log('Overlapping');
              if (revertFunc != null) {
                  revertFunc();
              }
              return false;
          }
          console.log('No overlapping');
          console.log('Quick edit - event id ' + event.event_id + ' / ' + event.start.format() + ' - ' + event.end.format());

          var customData = {};
          customData[fieldIdStart] = event.start.format('HH:mm');
          customData[fieldIdEnd] = event.end.format('HH:mm');
          customData[fieldIdRoom] = event.meeting_room;
          customData[fieldIdUchastniki] = event.meeting_uchastniki;
          var category_id = 0;
          if (show_categories == '1')
              category_id = event.category_id;
          var ajaxData = {
              key: api_key,
              project_id: $('#project_id').val(),
              author_id: event.event_author_id,
              assigned_to_id: event.assigned_to_id,
              category_id: category_id,
              subject: event.subject,
              start_date: event.start.format('YYYY-MM-DD'),
              due_date: event.end.format('YYYY-MM-DD'),
              custom_field_values: customData,
              event_id: event.event_id,
              recur: false,
              periodtype: 0,
              period: 0
          };
          
          $.ajax({
              url: baseUrl + '/' + pluginName + '/update',
              data: ajaxData,
              success: function (data) {
                  reloadCalendar();
              },
              beforeSend : function(xhr) {
                  showSpinner();
              },
              error : function(jqXHR, textStatus, errorThrown) {
                  hideSpinner();
                  revertFunc();
                  alert(textStatus + ": " + errorThrown);
              }
          });
          
          return true;
      };

      /*
      Author: shiju@qburst.com
      Description: toggle show and hide of reccur checkbox
      */
      var showHiderecurdiv = function() {
          if ($('#recurCheckbox').is(':checked')) {
              $('#recur_div').show('blind', {}, 500);
              var checked_value = $('input:radio[name=Week]:checked').val();
          } else {
              $('#recur_div').hide('blind', {}, 500);
              var checked_value = $('input:radio[name=Week]:checked').val();
              checked_value = '';
          }
          return checked_value;
      };
      /*
      Author: shiju@qburst.com
      Description: show spinner
      */
      var showSpinner = function() {
          $('#loading').show();
          allowEdit = false;
      };
      /*
      Author: shiju@qburst.com
      Description: hide spinner
      */
      var hideSpinner = function() {
          $('#loading').hide();
          allowEdit = true;
      };
      /*
      Author: shiju@qburst.com
      Description: reload calendar
      */
      var reloadCalendar = function() {
          current_room_index = 0;
           if (getEventsJSON(0)) {
              console.log('Reload Calender');
          }
      };
       $('#meeting_rooms').change(function() {
          reloadCalendar();
      });

      $('#sort_uchastniki').change(function() {
          reloadCalendar();
      });

      $('#project_id').change(function() {
          location.assign(baseUrl + '/' + pluginName + '/' + $('#project_id').val());
      });

      $('#start_time').change(function() {
          setEndTime();
      });

      $('#start_time_ill').change(function() {
          setEndTime_ill();
      });
      /*
      Author: shiju@qburst.com
      Description: set end-time wrt the selected start-time
      */
      var setEndTime = function() {
          $('#end_time').empty().append(end_time_clone);
          var start_time_sel_index = '';
          start_time_sel_index = $('#start_time').prop('selectedIndex') - 1;
          for (var j = start_time_sel_index; j >= 0; j--) {
              $('#end_time option:eq(' + j + ')').remove();
          }
          $('#end_time option:eq(1)').prop('selected', true);
          return true;
      };

      var setEndTime_ill = function() {
          $('#end_time_ill').empty().append(end_time_clone);
          var start_time_sel_index = '';
          start_time_sel_index = $('#start_time_ill').prop('selectedIndex') - 1;
          for (var j = start_time_sel_index; j >= 0; j--) {
              $('#end_time_ill option:eq(' + j + ')').remove();
          }
          $('#end_time_ill option:eq(1)').prop('selected', true);
          return true;
      };
      /*
      Author: shiju@qburst.com
      Description: validation to avaoid special characters in subject field
      */
      var validate = function() {
          var special_char = /[0-9a-zA-Zа-яА-ЯёЁ',-]+/;
          if (special_char.test($('#subject').val())) {
              return true;
          }
          return false;
      };
      
      /*
      Author: shiju@qburst.com
      Description: create/update event
      */
      $('#delete_meeting').click(function() {
          if ($('#event_id').val() <= 0)
              return false;

          var ajaxData = {
              key: api_key,
              event_id: $('#event_id').val()
          };
          console.log('Deleting');
          $.ajax({
              url : baseUrl + '/' + pluginName + '/delete',
              data : ajaxData,
              success : function(data) {
                  reloadCalendar();
              },
              beforeSend : function(xhr) {
                  showSpinner();
              },
              error : function(jqXHR, textStatus, errorThrown) {
                  hideSpinner();
                  alert(textStatus + ": " + errorThrown);
              }
          });
          if (ill){
              $('.saveillModal').dialog('close');
          }
          else {
              $('.saveMeetingModal').dialog('close');
          }


      });


      $('#delete_ill').click(function() {
          if ($('#event_id').val() <= 0)
              return false;

          var ajaxData = {
              key: api_key,
              event_id: $('#event_id').val()
          };
          console.log('Deleting');
          $.ajax({
              url : baseUrl + '/' + pluginName + '/delete',
              data : ajaxData,
              success : function(data) {
                  reloadCalendar();
              },
              beforeSend : function(xhr) {
                  showSpinner();
              },
              error : function(jqXHR, textStatus, errorThrown) {
                  hideSpinner();
                  alert(textStatus + ": " + errorThrown);
              }
          });
          if (ill){
              $('.saveillModal').dialog('close');
          }
          else {
              $('.saveMeetingModal').dialog('close');
          }


      });
      /*
      Author: shiju@qburst.com
      Description: create/update event
      */
      $('#save_meeting').click(function() {
          var date = window.moment($('#meeting_date').val(), long_date_format);
          var date_end = date.clone();
          if ((date.isoWeekday() == 6 || date.isoWeekday() == 7) && !(allow_weekends == 1)) {
              jAlert(langWarningWeekend, langInfo);
              return false;
          }
          
          if (allow_multiple_days == 1) {
              date_end = window.moment($('#meeting_end_date').val(), long_date_format);
              if ((date_end.isoWeekday() == 6 || date_end.isoWeekday() == 7) && !(allow_weekends == 1)) {
                  jAlert(langWarningWeekend, langInfo);
                  return false;
              }
          }
          
          var start_time = window.moment($('#start_time').val(), 'HH:mm');          
          date.hours(start_time.hours());
          date.minutes(start_time.minutes());
          
          var end_time = window.moment($('#end_time').val(), 'HH:mm');
          date_end.hours(end_time.hours());
          date_end.minutes(end_time.minutes());
          
          if (date_end.isBefore(date, 'minutes') || date_end.isSame(date, 'minutes')) {
              jAlert(langWarningUpdatePast, langInfo);
              return false;
          }       

          if ($('#subject').val() == '') {
              jAlert(langWarningFieldsMandatory, langInfo);
              return false;              
          }
          
          if (!validate()) {
              jAlert(langInvalidSubject, langInfo);
              return false;
          }
          
          if (isPastDay(date)) {
              jAlert(langWarningUpdatePast, langInfo);
              return false;
          }
          
          var periodtype = 0;
          var period = 0;
          if ($('#recurCheckbox').is(':checked')) {
              periodtype = parseInt($("#periodtype").val());
              period = parseInt($("#period").val());
          }
          
          if (isOverlapping($("#event_id").val(), $('#selected_meeting_room').val(), date, date_end, periodtype, period)) {
              jAlert(langRoomAlreadyBooked, langAlert);
              return false;
          }
          if (isOverlapping_uchastniki($("#event_id").val(), $('#selected_meeting_room').val(), date, date_end, periodtype, period, $('#selected_meeting_uchastniki').val())) {
              jAlert("Участник(и) занят(ы)!", langAlert);
              return false;
          }
          if (isOverlapping_bolezn($("#event_id").val(), $('#selected_meeting_room').val(), date, date_end, periodtype, period, $('#selected_meeting_uchastniki').val())) {
              jAlert("Участник(и) отсутствует(ют)!", langAlert);
              return false;
          }
          console.log('No overlapping');
          if (ill){
              $('.saveillModal').dialog('close');
          }
          else {
              $('.saveMeetingModal').dialog('close');
          }
          //setting the variable for update or create as required
          if ($('#event_id').val() == 0) {
              var action = 'create';
          } else {
              var action = 'update';
          }
          var customData = {};
          customData[fieldIdStart] = date.format('HH:mm');
          customData[fieldIdEnd] = date_end.format('HH:mm');
          customData[fieldIdRoom] = $('#selected_meeting_room').val();
          customData[fieldIdUchastniki] = $('#selected_meeting_uchastniki').val();
          var category_id = 0;
          if (show_categories == '1')
            category_id = $('#category_id').val();
          var ajaxData = {
              key: api_key,
              project_id: $('#project_id').val(),
              author_id : $('#author_id').val(),
              assigned_to_id : $('#assigned_to_id').val(),
              category_id: category_id,
              subject : $('#subject').val(),
              start_date : date.format('YYYY-MM-DD'),
              due_date : date_end.format('YYYY-MM-DD'),
              custom_field_values : customData,
              event_id : $('#event_id').val(),
              recur : $('#recurCheckbox').is(':checked'),
              periodtype : $('#periodtype').val(),
              period : $('#period').val()
          };
          $.ajax({
              url : baseUrl + '/' + pluginName + '/' + action,
              data : ajaxData,
              success : function(data) {
                  reloadCalendar();
              },
              beforeSend : function(xhr) {
                  showSpinner();
              },
              error : function(jqXHR, textStatus, errorThrown) {
                  hideSpinner();
                  alert(textStatus + ": " + errorThrown);
              }
          });
          $('#event_id').val(0);
          $('#recur_meeting').val('');
      });

      $('#save_ill').click(function() {
          var date = window.moment($('#meeting_date_ill').val(), long_date_format);

          var   date_end = window.moment($('#meeting_end_date_ill').val(), long_date_format);
          var start_time = window.moment($('#start_time_ill').val(), 'HH:mm');
          date.hours(start_time.hours());
          date.minutes(start_time.minutes());

          var end_time = window.moment($('#end_time_ill').val(), 'HH:mm');
          date_end.hours(end_time.hours());
          date_end.minutes(end_time.minutes());

          if (date_end.isBefore(date, 'minutes') || date_end.isSame(date, 'minutes')) {
              jAlert(langWarningUpdatePast, langInfo);
              return false;
          }

          if ($('#subject_ill').val() == '') {
              jAlert(langWarningFieldsMandatory, langInfo);
              return false;
          }

          if (isPastDay(date)) {
              jAlert(langWarningUpdatePast, langInfo);
              return false;
          }

          var periodtype = 0;
          var period = 0;
          if (ill){
              $('.saveillModal').dialog('close');
          }
          else {
              $('.saveMeetingModal').dialog('close');
          }
          //setting the variable for update or create as required
          if ($('#event_id').val() == 0) {
              var action = 'create';
          } else {
              var action = 'update';
          }
          var customData = {};
          customData[fieldIdStart] = date.format('HH:mm');
          customData[fieldIdEnd] = date_end.format('HH:mm');
          customData[fieldIdRoom] = "Ill";
          customData[fieldIdUchastniki] = $('#selected_meeting_uchastniki_ill').val();
          var category_id = 0;
          if (show_categories == '1')
              category_id = $('#category_id').val();
          var ajaxData = {
              key: api_key,
              project_id: $('#project_id').val(),
              author_id : $('#author_id').val(),
              assigned_to_id : $('#assigned_to_id').val(),
              category_id: category_id,
              subject : $('#subject_ill').val(),
              start_date : date.format('YYYY-MM-DD'),
              due_date : date_end.format('YYYY-MM-DD'),
              custom_field_values : customData,
              event_id : $('#event_id').val(),
              recur : $('#recurCheckbox').is(':checked'),
              periodtype : $('#periodtype').val(),
              period : $('#period').val()
          };
          $.ajax({
              url : baseUrl + '/' + pluginName + '/' + action,
              data : ajaxData,
              success : function(data) {
                  reloadCalendar();
              },
              beforeSend : function(xhr) {
                  showSpinner();
              },
              error : function(jqXHR, textStatus, errorThrown) {
                  hideSpinner();
                  alert(textStatus + ": " + errorThrown);
              }
          });
          $('#event_id').val(0);
          $('#recur_meeting').val('');
      });
      /*
      Author: shiju@qburst.com
      Description: Save the meeting on stroke of ENTER button
      */
      $('.saveMeetingModal').keypress(function(e) {
          if (e.which == 13) {
              jQuery('#save_meeting').focus().click();
              e.preventDefault();
              return false;
          }
      });
      
      var localize = function() {          
          //localization
          window.moment.locale(current_lang);
          var weekdays_min = window.moment.weekdaysMin();
          var weekdays_short = window.moment.weekdaysShort();
          var weekdays = window.moment.weekdays();
          var months_short = window.moment.monthsShort();
          var months = window.moment.months();
          
          var hide_weekends = $.datepicker.noWeekends;
          if (allow_weekends == 1) {
              hide_weekends = function(date) { return [true, "", ""]; };
          }
          
          var locale_Data = window.moment.localeData();
          if (first_day_of_week == -1) {
            first_day = locale_Data.firstDayOfWeek();
          } else {
            first_day = first_day_of_week;
          }
          if (redmine_date_format == "") {
            long_date_format = locale_Data.longDateFormat('L');
          } else {
            long_date_format = redmine_date_format;
          }
          long_date_format_datepicker = long_date_format.toLocaleLowerCase();
          long_date_format_datepicker = long_date_format_datepicker.replace(/yy/g, 'y').replace(/mmmm/g, 'MM').replace(/mmm/g, 'M');
          if (redmine_time_format == "") {
            long_time_format = locale_Data.longDateFormat('LT');
          } else {
            long_time_format = redmine_time_format;
          }
          
          $('#datepicker').datepicker({ 
              inline : false,
              firstDay : first_day,
              dateFormat : long_date_format_datepicker,
              minDate : 0, // past days disabled
              monthNamesShort : months_short,
              monthNames : months,
              dayNamesMin : weekdays_min,
              dayNamesShort : weekdays_short,
              dayNames : weekdays,              
              beforeShowDay: hide_weekends,
              onSelect : function(dateText, inst) {
                  $('#calendar').fullCalendar('changeView', 'agendaDay');
                  $('#calendar').fullCalendar('gotoDate', $('#datepicker').datepicker("getDate"));
              }
          });
          
          $('#meeting_date').datepicker({
              inline : false,
              firstDay : first_day,
              dateFormat : long_date_format_datepicker,
              minDate : 0, // past days disabled
              monthNamesShort : months_short,
              monthNames : months,
              dayNamesMin : weekdays_min,
              dayNamesShort : weekdays_short,
              dayNames : weekdays,
              
              beforeShowDay: hide_weekends
          });
          $('#meeting_date_ill').datepicker({
              inline : false,
              firstDay : first_day,
              dateFormat : long_date_format_datepicker,
              minDate : 0, // past days disabled
              monthNamesShort : months_short,
              monthNames : months,
              dayNamesMin : weekdays_min,
              dayNamesShort : weekdays_short,
              dayNames : weekdays,

              beforeShowDay: hide_weekends
          });
          $('#meeting_end_date_ill').datepicker({
              inline : false,
              firstDay : first_day,
              dateFormat : long_date_format_datepicker,
              minDate : 0, // past days disabled
              monthNamesShort : months_short,
              monthNames : months,
              dayNamesMin : weekdays_min,
              dayNamesShort : weekdays_short,
              dayNames : weekdays,
              beforeShowDay: hide_weekends
          });
          $('#meeting_end_date').datepicker({
              inline : false,
              firstDay : first_day,
              dateFormat : long_date_format_datepicker,
              minDate : 0, // past days disabled
              monthNamesShort : months_short,
              monthNames : months,
              dayNamesMin : weekdays_min,
              dayNamesShort : weekdays_short,
              dayNames : weekdays,
              beforeShowDay: hide_weekends
          });
          
          $('#start_time').empty();
          for (var i = 0; i < all_start_times.length; i++) {
              $('#start_time').append($('<option>', { 
                  value: all_start_times[i],
                  text : window.moment(all_start_times[i], 'HH:mm').format(long_time_format)
              }));
          }
          $('#start_time_ill').empty();
          for (var i = 0; i < all_start_times.length; i++) {
              $('#start_time_ill').append($('<option>', {
                  value: all_start_times[i],
                  text : window.moment(all_start_times[i], 'HH:mm').format(long_time_format)
              }));
          }
          $('#end_time').empty();
          for (var i = 0; i < all_end_times.length; i++) {
              $('#end_time').append($('<option>', { 
                  value: all_end_times[i],
                  text : window.moment(all_end_times[i], 'HH:mm').format(long_time_format)
              }));
          }
          $('#end_time_ill').empty();
          for (var i = 0; i < all_end_times.length; i++) {
              $('#end_time_ill').append($('<option>', {
                  value: all_end_times[i],
                  text : window.moment(all_end_times[i], 'HH:mm').format(long_time_format)
              }));
          }
          start_time_clone = $('#start_time option').clone();
          end_time_clone = $('#end_time option').clone();
          start_time_clone_ill = $('#start_time_ill option').clone();
          end_time_clone_ill = $('#end_time_ill option').clone();
      };
      
      localize();

      loadCalendar();
      // intial load calendar
      
      localize();
      $('#project_id').focus();
  }); 
