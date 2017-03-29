var dmp = new diff_match_patch();

function getDiff(text1, text2, opts) {
  text1 = text1 || '';
  text2 = text2 || '';

  opts = opts || {};
  opts.timeout = opts.timeout || 1;
  opts.cost = opts.cost || 4;
  opts.cleanup = opts.cleanup || 'semantic';


  var ms_start = (new Date()).getTime();
  var d = dmp.diff_main(text1, text2);
  var ms_end = (new Date()).getTime();

  if (opts.cleanup === 'semantic') {
    dmp.diff_cleanupSemantic(d);
  }
  if (opts.cleanup === 'efficiency') {
    dmp.diff_cleanupEfficiency(d);
  }

  return dmp.diff_prettyHtml(d);
}

function launch() {
  $('.case-diff').each(function () {
    var $this = $(this);
    var text1 = $this.find('.source1').val();
    var text2 = $this.find('.source2').val();
    
    var ds = getDiff(text1, text2, {
      timeout: 1,
      // cost: cost,
      cleanup: 'semantic' // 'semantic' | 'efficiency' | 'none'
    });

    $this.find('.result').html(ds);
  });
  $('.toggle').click(function () {
    var $this = $(this);
    $this.parent().find('textarea').toggle();
  });
}

$(function () {
  launch();
});
