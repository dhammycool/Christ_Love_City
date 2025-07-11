$(document).ready(function () {
  // Role change toggle
  $('#role').on('change', function () {
    const role = $(this).val();

    $('#hqFields input, #branchFields input, #memberFields input').prop('required', false);
    $('#hqFields, #branchFields, #memberFields').hide();

    if (role === 'hq_admin') {
      $('#hqFields').show().find('input').prop('required', true);
    } else if (role === 'branch_admin') {
      $('#branchFields').show().find('input').prop('required', true);
    } else if (role === 'member') {
      $('#memberFields').show().find('input').prop('required', true);
    }
  });

  $('#role').trigger('change');

  // Java toggles
  $('.java_head').click(function () {
    $('#java_sub').slideToggle();
  });
  $('.java_head_one').click(function () {
    $('#java_sub_one').slideToggle();
  });
  $('.java_head_two').click(function () {
    $('#java_sub_two').slideToggle();
  });

  // Sidebar navigation
  $('.sidebar-link, .hq-nav-link').click(function (e) {
    e.preventDefault();
    const sectionId = $(this).data('section');
    $('.hq-section, #dashboard, #approvals, #settings').hide();
    $('#' + sectionId).show();
  });

  // HQ tabs inside documents center
  $('.hq-tab').click(function () {
    $('.hq-tab').removeClass('active');
    $(this).addClass('active');

    const tabTarget = $(this).data('tab');
    $('.hq-tab-content').addClass('hidden');
    $('#' + tabTarget).removeClass('hidden');
  });

  // Approve Branch Admins
  $('.hq-approve-btn, .approve-btn').click(function () {
    const row = $(this).closest('tr');
    alert(`Approved branch admin: ${row.find('td').eq(0).text()}`);
    row.remove();
  });

  // Upload Document forms
  $('.hq-form, #upload-form').submit(function (e) {
    e.preventDefault();
    alert('Document sent successfully (mock)!');
    this.reset();
  });

  // Approve couples buttons
  $('.approve-couple-btn').click(function () {
    const row = $(this).closest('tr');
    row.find('td').eq(3).text('Approved');
    alert(`Approved couple: ${row.find('td').eq(0).text()} & ${row.find('td').eq(1).text()}`);
    $(this).prop('disabled', true);
  });
});

// Vanilla JS tabs
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const target = tab.dataset.tab;
    tabContents.forEach(tc => {
      tc.classList.toggle('hidden', tc.id !== target);
    });
  });
});

// Manage Denominations & Branches lists
const denomForm = document.getElementById('denom-branch-form');
const branchForm = document.getElementById('branch-form');
const denomList = document.getElementById('denominations');
const branchList = document.getElementById('branches');

if (denomForm) {
  denomForm.addEventListener('submit', e => {
    e.preventDefault();
    const denomInput = document.getElementById('denomination');
    if (denomInput.value.trim() !== '') {
      const li = document.createElement('li');
      li.textContent = denomInput.value.trim();
      denomList.appendChild(li);
      denomInput.value = '';
    }
  });
}

if (branchForm) {
  branchForm.addEventListener('submit', e => {
    e.preventDefault();
    const branchInput = document.getElementById('branch');
    if (branchInput.value.trim() !== '') {
      const li = document.createElement('li');
      li.textContent = branchInput.value.trim();
      branchList.appendChild(li);
      branchInput.value = '';
    }
  });
}
