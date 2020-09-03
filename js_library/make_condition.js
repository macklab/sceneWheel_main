// *
// Make experiment condition before starting experiment
// To each radius value (2^n), assign random scene number.
// Each radius would tested 'n_repeition' times 
// *

function make_condition(n_radius, n_bin_onWheel, n_repetition, n_block) {

    // make empty condition
    var basic_condition =[];
    
    // seed_point on wheel
    var bin_startPoint = [];
    for (i=0; i<n_bin_onWheel; i++) {
        var bin_width = 360/n_bin_onWheel;
        bin_startPoint.push(i*bin_width);
    }

    // jitter setting
    var jitter_option = [];
    for (i=0; i<bin_width; i++) {
        jitter_option.push(i);
    }
    
    // assign value to each bin in each radius condition for each repetition
    for (r=0; r<n_radius; r++) {
        for (b=0; b<n_bin_onWheel; b++) {
            var shuffled_jitter = _.shuffle(jitter_option);
            for (rp=0; rp<n_repetition; rp++){                
                basic_condition.push({
                    radius: ('00'+ Math.pow(2,r+1)).slice(-2).toString(), // radius was 2^n
                    scene_num: ('00000'+(bin_startPoint[b]+shuffled_jitter[rp])).slice(-6).toString()                   
                })
            }
            
        }
    }
    
    // slice by n_block
    var final_condition = _.chunk(_.shuffle(basic_condition), basic_condition.length/n_block);
    
    return final_condition;


}
