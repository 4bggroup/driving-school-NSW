/** Client-side enquiry wizard. Does NOT charge, send, reserve or confirm a lesson. */
(() => {
  'use strict';
  const bookingConfig = {
    bookingEmail: '', // Owner must insert a verified business inbox before email drafts become available.
    maxDaysAhead: 63
  };
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));
  const form = $('#bookingWizard');
  if (!form) return;
  const steps = $$('.booking-step', form);
  const rail = $$('#stepRail span');
  const labels = [
    'CHOOSE YOUR DURATION.',
    'CHOOSE A PREFERRED TIME.',
    'YOUR CONTACT DETAILS.',
    'REVIEW YOUR ENQUIRY.'
  ];
  let step = 0;
  let pickedDate = null;
  const today = new Date(); today.setHours(0,0,0,0);
  let viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + bookingConfig.maxDaysAhead);
  const dateFormatter = new Intl.DateTimeFormat('en-AU',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  const monthFormatter = new Intl.DateTimeFormat('en-AU',{month:'long',year:'numeric'});
  const two = x => String(x).padStart(2,'0');
  const iso = d => `${d.getFullYear()}-${two(d.getMonth()+1)}-${two(d.getDate())}`;
  const asDate = value => { if (!value) return null; const [y,m,d] = value.split('-').map(Number); return new Date(y,m-1,d); };
  const checked = name => form.querySelector(`input[name="${name}"]:checked`)?.value || '';
  const value = id => ($(id)?.value || '').trim();
  const errorEl = $('#formError');
  const showError = message => { errorEl.textContent=message; errorEl.hidden=false; };
  const clearError = () => { errorEl.textContent=''; errorEl.hidden=true; };

  const calendarTitle = $('#calendarTitle');
  const calendarDays = $('#calendarDays');
  function renderCalendar(){
    calendarTitle.textContent = monthFormatter.format(viewMonth).toUpperCase();
    calendarDays.replaceChildren();
    const month = viewMonth.getMonth();
    const year = viewMonth.getFullYear();
    const startDay = (new Date(year,month,1).getDay()+6)%7;
    for(let i=0;i<startDay;i++){
      const placeholder = document.createElement('span');placeholder.className='cal-placeholder';placeholder.setAttribute('aria-hidden','true');calendarDays.appendChild(placeholder);
    }
    const count = new Date(year,month+1,0).getDate();
    for(let i=1;i<=count;i++){
      const day = new Date(year,month,i);
      const button = document.createElement('button');
      button.type='button';button.textContent = String(i);
      const valid = day >= today && day <= maxDate;
      button.disabled = !valid;
      button.setAttribute('aria-label', `Prefer ${dateFormatter.format(day)}`);
      button.setAttribute('aria-pressed', String(iso(day)===pickedDate));
      if (iso(day)===pickedDate) button.classList.add('is-picked');
      button.addEventListener('click',()=>{pickedDate=iso(day);clearError();renderCalendar();});
      calendarDays.appendChild(button);
    }
    $('#calPrev').disabled = viewMonth.getFullYear()===today.getFullYear() && viewMonth.getMonth()===today.getMonth();
    const maxMonth = new Date(maxDate.getFullYear(),maxDate.getMonth(),1);
    $('#calNext').disabled = viewMonth.getTime()>=maxMonth.getTime();
  }
  $('#calPrev').addEventListener('click',()=>{viewMonth=new Date(viewMonth.getFullYear(),viewMonth.getMonth()-1,1);renderCalendar();});
  $('#calNext').addEventListener('click',()=>{viewMonth=new Date(viewMonth.getFullYear(),viewMonth.getMonth()+1,1);renderCalendar();});
  renderCalendar();

  function gotoStep(next){
    step = Math.max(0,Math.min(3,next));
    steps.forEach((node,i)=>{node.hidden=i!==step;node.classList.toggle('active',i===step);});
    rail.forEach((part,i)=>part.classList.toggle('on',i<=step));
    $('#stepTitle').textContent=labels[step];
    $('#stepNumber').textContent=two(step+1);
    $('#stepBack').hidden=step===0;
    $('#stepNext').hidden=step===3;
    $('#controlsNote').textContent=`STEP ${two(step+1)} — ${['CHOOSE A DURATION','PICK A PREFERRED DATE','A FEW DETAILS','REVIEW YOUR REQUEST'][step]}`;
    if(step===3) fillSummary();
    clearError();
    const panel = $('.booking-form-wrap');
    const bounds = panel?.getBoundingClientRect();
    if (bounds && bounds.top < 30){panel.scrollIntoView({behavior:'smooth',block:'start'});}
  }
  function validate(){
    if(step===0){if(!checked('duration')){showError('Choose a lesson duration to continue.');return false;}if(!value('#lessonFocus')){showError('Choose what you would like to practise.');return false;}}
    if(step===1){
      if(!pickedDate){showError('Please choose a preferred date.');return false;}
      const suburb = value('#pickupSuburb');
      if(suburb.length<2){showError('Enter a pickup suburb to continue.'); $('#pickupSuburb').focus();return false;}
    }
    if(step===2){
      if(value('#customerName').length<2){showError('Enter your name so we can address the enquiry.');$('#customerName').focus();return false;}
      const phone = value('#customerPhone').replace(/[ ()-]/g,'');
      if(!/^\+?[0-9]{8,15}$/.test(phone)){showError('Enter a valid contact phone number.');$('#customerPhone').focus();return false;}
      if(!$('#customerEmail').checkValidity()){showError('Enter a valid email address.');$('#customerEmail').focus();return false;}
      if(!$('#privacyConsent').checked){showError('Please agree to be contacted about your enquiry.');$('#privacyConsent').focus();return false;}
    }
    return true;
  }
  $('#stepNext').addEventListener('click',()=>{if(validate())gotoStep(step+1);});
  $('#stepBack').addEventListener('click',()=>gotoStep(step-1));
  form.addEventListener('submit',e=>e.preventDefault());
  form.addEventListener('input', clearError);

  const escapeHTML = text => String(text).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function fields(){
    return [
      ['Duration',checked('duration')],
      ['Lesson focus',value('#lessonFocus')],
      ['Preferred date',pickedDate?dateFormatter.format(asDate(pickedDate)):'Not chosen'],
      ['Time window',checked('time')],
      ['Pickup suburb',value('#pickupSuburb')],
      ['Transmission',value('#transmission')],
      ['Name',value('#customerName')],
      ['Phone',value('#customerPhone')],
      ['Email',value('#customerEmail')],
      ['Notes',value('#customerNotes')||'None supplied']
    ];
  }
  function enquiryText(){
    return 'DRIVING LESSON ENQUIRY — PARRAMATTA DRIVE ACADEMY\n\n' + fields().map(([k,v])=>`${k}: ${v}`).join('\n') + '\n\nThis is a preferred-date enquiry. It is not a confirmed booking.';
  }
  function fillSummary(){
    $('#reviewInfo').innerHTML=fields().map(([k,v],i)=>`<div class="${i===9?'wide':''}"><small>${escapeHTML(k.toUpperCase())}</small><strong>${escapeHTML(v)}</strong></div>`).join('');
    const link = $('#emailEnquiry');
    if(bookingConfig.bookingEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingConfig.bookingEmail)){
      link.href = `mailto:${encodeURIComponent(bookingConfig.bookingEmail)}?subject=${encodeURIComponent('Driving lesson enquiry — '+checked('duration')+' — '+value('#lessonFocus'))}&body=${encodeURIComponent(enquiryText())}`;
      link.hidden = false;
    } else {link.hidden=true;}
    $('#copyResult').textContent='';
  }
  $('#copyEnquiry').addEventListener('click',async()=>{
    const text = enquiryText();
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const temp=document.createElement('textarea');temp.value=text;temp.style.position='fixed';temp.style.left='-9999px';document.body.appendChild(temp);temp.select();
        if(!document.execCommand('copy')) throw new Error('Clipboard unavailable');
        temp.remove();
      }
      $('#copyResult').textContent='Enquiry copied. You can now paste it into an email or message to the school.';
    }catch(e){$('#copyResult').textContent='Copying is unavailable in this browser. You can select and copy the details above.';}
  });
  // Selecting a focus elsewhere on the page keeps the chosen duration intact.
  window.addEventListener('pda:select-lesson', e=>{
    const focus = $('#lessonFocus');
    if (focus && Array.from(focus.options).some(option => option.value === e.detail.lesson)) {
      focus.value = e.detail.lesson;
    }
    if(step!==0)gotoStep(0);
  });
  // Session-length CTAs pre-select the matching duration and open the enquiry studio.
  document.querySelectorAll('[data-select-duration]').forEach(button => button.addEventListener('click', () => {
    const radio = $$('input[name="duration"]', form).find(input => input.value === button.dataset.selectDuration);
    if (radio) {radio.checked = true; radio.dispatchEvent(new Event('change',{bubbles:true}));}
    gotoStep(0);
    document.querySelector('#booking')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }));
  gotoStep(0);
})();
