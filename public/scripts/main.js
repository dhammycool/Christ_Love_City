$(document).ready(function () {
  $('#role').on('change', function () {
  const role = $(this).val();


  $('#hqFields input, #branchFields input, #memberFields input').prop('required', false);
  $('#hqFields').hide();
  $('#branchFields').hide();
  $('#memberFields').hide();

  if (role === 'hq_admin') {
    $('#hqFields').show();
    $('#hqFields input').prop('required', true);
  } else if (role === 'branch_admin') {
    $('#branchFields').show();
    $('#branchFields input').prop('required', true);
  } else if (role === 'member') {
    $('#memberFields').show();
    $('#memberFields input').prop('required', true);
  }
});

  $('.java_head').click(function () {
    $('#java_sub').slideToggle();
  });

  $('.java_head_one').click(function () {
    $('#java_sub_one').slideToggle();
  });

  $('.java_head_two').click(function () {
    $('#java_sub_two').slideToggle();
  });
  $('#role').trigger('change');
});