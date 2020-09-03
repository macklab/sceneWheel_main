/**
 * jspsych-reconstruction
 * a jspsych plugin for a reconstruction task where the subject recreates
 * a stimulus from memory, by using computer mouse
 *
 * Gaeun & Mike
 *
 *
 */


jsPsych.plugins['mouse-reconstruction'] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'mouse-reconstruction',
    description: '',
    parameters: {
      // stim_function: {
      //   type: jsPsych.plugins.parameterType.FUNCTION,
      //   pretty_name: 'Stimulus function',
      //   default: undefined,
      //   description: 'A function with a single parameter that returns an HTML-formatted string representing the stimulus.'
      // }, 
      div_name: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'DIV that contains wheel',
        default: undefined,
        description: 'DIV property where adjustment stimuli (scene and handle) are presented.'
      },
      starting_value: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Starting value',
        default: 360,
        description: 'The starting value of the stimulus parameter.'
      },
      current_wheel: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Current wheel for this trial',
        default: undefined,
        description: 'A wheel to be preloaded for this trial'
      },
      current_radius: {
        type: jsPsych.plugins.parameterType.FUNCTION,
        pretty_name: 'Current radius for this trial',
        default: undefined,
        description: 'A radius of current wheel to be preloaded for this trial'
      }
    }
  }

  plugin.trial = function(display_element, trial) {    

    // * image host * //
    // const img_host = 'https://macklab.dev/resources/sceneWheel/';

    // Fixation while preloading
    var html = '<div id="'+trial.div_name+'" style="font-size:24px;">+</div>'
    display_element.innerHTML = html;    
    var fixstart = performance.now();

    // preloading images of the current wheel
    var wheel_num = trial.current_wheel;
    var wheel_rad = trial.current_radius;
    var images = []
    for (i = 0; i < 360; i++) {
      images.push(
        img_host+'sceneWheel_imgs/Wheel'+wheel_num+
        '/wheel'+wheel_num+'_r'+wheel_rad+
        '/'+("000000"+i).slice(-6)+'.webp'
      );                           
    }
    jsPsych.pluginAPI.preloadImages(images, wait_fix)

    function wait_fix() {
      var diff = performance.now()-fixstart;
      if(diff>1000){
        run_trial();
      }else{
        jsPsych.pluginAPI.setTimeout(run_trial,1000-diff);
      }
    }    

    // Run adjustment trial (draw images according to mouse position)
    function run_trial() {
      // start time
      var start_time = performance.now();

      // random wheel starting point
      var wsp = Math.floor(Math.random() * 360);      
      
      // current param (will be continuously updated)
      var param = trial.starting_value;
      
      // Send current param to display function   
      function draw(param) {

        // make initual display with the wheel without indicator bar         
        if (param==360){
          var handle = 'materials/noBar_wheel.png';
        } else{
          var handle = 'materials/handle_wheel.png';
        }

        // var html = trial.stim_function(param, wsp); // <- this is for when stimuli are drawn outside this plugin
        sceneNum = ("000000" + param).slice(-6);                                          
        var html = "<div id='"+trial.div_name+"'>"+                      
            '<img src="'+img_host+'sceneWheel_imgs/Wheel'+wheel_num+
            '/wheel'+wheel_num+'_r'+wheel_rad+
            '/'+sceneNum+'.webp" '+
            'style="width:20%"></div>'+            
            '<div id="'+trial.div_name+'"><img src="'+handle+'"'+
            'style="width:35%; transform: rotate('+(param+wsp)+'deg)"></div>';

        display_element.innerHTML = html;
      }

      // Get mouse position and param(current angle pointed by mouse)
      var mousemovementevent = function(e){
        var x = e.clientX-container_centerX;
        var y = e.clientY-container_centerY;
        mouse_angle = Math.floor((Math.atan2(y, x)*180/Math.PI + 360 )% 360); // in positive, integer, degree unit
        param = ((mouse_angle - wsp + 360) % 360); // "+360 %360" is to make scene index a positive value
                  
        // refresh the display
        draw(param);
      }
      document.addEventListener('mousemove', mousemovementevent);      

    
      // Finish trial
      var mouseclickevent = function(){
        document.removeEventListener('mousemove', mousemovementevent);
        var end_time = performance.now();
        var response_time = end_time - start_time;
        var final_angle = param;        
        // save data
        var trial_data = {
          "fix_duration": start_time - fixstart,
          "rt": response_time,
          "response": final_angle          
        };
        display_element.innerHTML = "";       

        document.removeEventListener("click", mouseclickevent);

        // next trial
        jsPsych.finishTrial(trial_data);       
        
      }
      document.addEventListener("click", mouseclickevent);

      // initial draw
      draw(param);

      // Get center coordinates of the adjustment task container
      var arena = document.getElementById(trial.div_name);
      var rect = arena.getBoundingClientRect();      
      var container_centerX = rect.left + rect.width/2;
      var container_centerY = rect.top + rect.height/2;
      
    }

  };

  return plugin;
})();
