let sentences = JSON.parse(localStorage.getItem('sentences') || '[]');
let settings = JSON.parse(localStorage.getItem('settings')) || { click: 'strike', theme: 'light' }
let currentIndex = localStorage.getItem('currentIndex') || null

const getHijriDate = () => {
    return new Intl.DateTimeFormat('ar-TN-u-ca-islamic', {
        month: 'long', weekday: 'long', day: 'numeric', year: 'numeric'
    }).format(new Date());
};

const getTodayKey = () => {
    const date = new Date();
    return date.toLocaleDateString('ar-EG', { weekday: 'long', timeZone: 'Asia/Beirut' });
};

const getHijriDay = () => {
    return getHijriDate().split(' ')[1];
}

const getHijriMonth = () => {
    return new Intl.DateTimeFormat('ar-TN-u-ca-islamic', {
        month: 'long'
    }).format(new Date());
};

const today = getTodayKey();
const hijriMonth = getHijriMonth();

let isNewDay = false;

let lastDay = localStorage.getItem('lastDay') || '';
if (!lastDay || lastDay != today) {
    isNewDay = true;
}

function updateDate(_currentIndex = null) {
    const today = getTodayKey();
    const hijriMonth = getHijriMonth()
    const hDay = getHijriDay();

    console.log({ today, hijriMonth, hDay })
    $('#today-name').text(today)
    $('#month-name').text(hijriMonth)
    $('#hijri-date').html(getHijriDate())

    if (localStorage.getItem('lastDay') != today) {
        isNewDay = true
        $('#sentence-day').val(today)
        $('#sentence-month').val(hijriMonth)
        $('#sentence-daynum').val(hDay)
    }

    $('#click-behavior').val(settings.click)

    if (_currentIndex === null || _currentIndex === "null")
        renderSentences(today, hijriMonth, hDay)
    else
        showRepeat(_currentIndex)
}

function addSentence() {
    const title = $('#sentence-title').val()
    const text = $('#sentence-text').val()
    const pretext = $('#sentence-pretext').val()
    const aftertext = $('#sentence-after-text').val()
    const count = parseInt($('#sentence-count').val()) || 1
    const type = $('#sentence-type').val()
    const day = $('#sentence-day').val()
    const month = $('#sentence-month').val()
    const dayNum = $('#sentence-daynum').val()
    const mode = $('#sentence-mode').val() || 'repeat'

    if (!text.trim() || !title.trim()) return alert('يرجى إدخال عنوان ونص الذكر')

    sentences.push({ title, text, count, type, day, month, dayNum, lastDone: null, done: 0, pretext, aftertext,mode })
    localStorage.setItem('sentences', JSON.stringify(sentences));
    $('#addModal').modal('hide')
    clearAddForm()
    updateDate()
}

function clearAddForm() {
    $('#sentence-title').val('')
    $('#sentence-text').val('')
    $('#sentence-pretext').val('')
    $('#sentence-after-text').val('')
    $('#sentence-count').val('')
    $('#sentence-type').val('دعاء')
    $('#sentence-day').val('')
    $('#sentence-month').val('')
    $('#sentence-daynum').val('')
    $('#sentence-mode').val('')
}

function editSentence() {
    const index = $('#edited-sentence-index').val()
    const title = $('#edited-sentence-title').val()
    const text = $('#edited-sentence-text').val()
    const pretext = $('#edited-sentence-pretext').val()
    const aftertext = $('#edited-sentence-after-text').val()
    const count = parseInt($('#edited-sentence-count').val()) || 1
    const type = $('#edited-sentence-type').val()
    const day = $('#edited-sentence-day').val()
    const month = $('#edited-sentence-month').val()
    const dayNum = $('#edited-sentence-daynum').val()
    const mode = $('#edited-sentence-mode').val() || 'repeat'

    if (!text.trim() || !title.trim()) return alert('يرجى إدخال عنوان ونص الذكر')

    let done = sentences[index].done
    let lastDone = done >= count ? sentences[index].lastDone : null
    
    sentences[index] = { title, text, count, type, day, month, dayNum, lastDone, done, pretext, aftertext,mode }
    localStorage.setItem('sentences', JSON.stringify(sentences));
    $('#editModal').modal('hide')
    clearEditForm()
    updateDate()
}

function clearEditForm() {
    $('#edited-sentence-title').val('')
    $('#edited-sentence-text').val('')
    $('#edited-sentence-pretext').val('')
    $('#edited-sentence-after-text').val('')
    $('#edited-sentence-count').val('')
    $('#edited-sentence-type').val('دعاء')
    $('#edited-sentence-day').val('')
    $('#edited-sentence-month').val('')
    $('#edited-sentence-daynum').val('')
    $('#edited-sentence-mode').val('')
}

function saveSettings() {
    settings.click = $('#click-behavior').val()
    settings.theme = $('#theme').val()

    localStorage.setItem('settings', JSON.stringify(settings))
    $('#settingsModal').modal('hide')
    $('html').attr('data-bs-theme', settings.theme)
    if (currentIndex)
        showRepeat(currentIndex)
}

function renderSentences(todayName, hijriMonth, hijriDay) {
    $('#day-section, #month-section, #general-section').empty()
    const today = getTodayKey()

    for (let [index, s] of sentences.entries()) {
        if (isNewDay && (!s.month || s.month !== hijriMonth || (s.month && (s.day || s.dayNum)))) {
            s.done = 0;
            sentences[index].done = 0
            s.lastDone = null
            sentences[index].lastDone = null
        }

        const isToday = s.day === todayName || s.dayNum == hijriDay
        const isMonth = s.month === hijriMonth
        const isGeneral = !s.day && !s.month && !s.dayNum

        const doneKey = `${s.title}-${today}`;

        const isDone = s.lastDone === today

        const count = (s.done < s.count ? s.done + '/' : '') + s.count
        const el = $(`<div class="d-flex align-items-center sentence-box ${isDone ? 'done' : ''} gap-2 shadow-sm"><div onclick="showRepeat('${index}')" style="flex: 1;">
            ${s.title}</div> <small>(${count})</small>
            <button class="btn btn-danger edit-sentence px-2 mx-2" data-bs-toggle="modal" data-bs-target="#editModal"><i class="bi bi-pencil-fill"></i></button>
          </div>`)

        if (isToday) $('#day-section').append(el)
        else if (isMonth) $('#month-section').append(el)
        else if (isGeneral) $('#general-section').append(el)

        el.find('.edit-sentence').click(function () {
            setTimeout(() => {
                $('#edited-sentence-title').val(s.title)
                $('#edited-sentence-pretext').val(s.pretext)
                $('#edited-sentence-text').val(s.text)
                $('#edited-sentence-after-text').val(s.aftertext)
                $('#edited-sentence-count').val(s.count)
                $('#edited-sentence-daynum').val(s.daynum)
                $('#edited-sentence-month').val(s.month)
                $('#edited-sentence-day').val(s.day)
                $('#edited-sentence-type').val(s.type)
                $('#edited-sentence-index').val(index)
                $('#edited-sentence-mode').val(s.mode || 'repeat')
            }, 100)
        })
    }

    if (isNewDay) {
        localStorage.setItem('sentences', JSON.stringify(sentences))
        localStorage.setItem('lastDay', today)
        isNewDay = false
    }
}

function showRepeat(index) {
    const s = sentences[index]
    if (!s) return

    if (s.mode && s.mode === 'counter') {
        if (sentences[index].done < sentences[index].count) {
            sentences[index].done++;
            localStorage.setItem('sentences', JSON.stringify(sentences))
        }
        
        if (sentences[index].done === sentences[index].count) {
            sentences[index].lastDone = today
        }
        updateDate()
        return
    }

    currentIndex = index
    localStorage.setItem('currentIndex', currentIndex)

    $('#repeat-title').text(s.title)
    $('#repeated-sentences').empty()
    $('#repeated-sentences').append(`<div class="mb-2">${s.pretext || ''}</div>`)
    for (let i = 0; i < s.count; i++) {
        const doneClass = i < s.done ? ' done' : ''

        if (doneClass && settings.click != 'strike')
            continue

        const line = $(`<div class="sentence-box shadow-sm ${doneClass}">${s.text}</div>`)
        line.click(function () {
            if (settings.click === 'hide') $(this).hide('100')
            else if (settings.click === 'strike') $(this).toggleClass('done')
            else if (settings.click === 'remove') $(this).remove()

            const incrementBy = settings.click != 'strike' || $(this).hasClass('done') ? 1 : -1

            if (!sentences[index].done || (incrementBy < 0 && sentences[index].done > 0) || (incrementBy > 0 && sentences[index].done < sentences[index].count))
                sentences[index].done = sentences[index].done ? sentences[index].done + incrementBy : 1
            // mark as done if all are clicked
            if ((settings.click === 'strike' && $('#repeated-sentences .sentence-box.done:visible').length === s.count) || (settings.click === 'hide' && $('#repeated-sentences .sentence-box:visible').length <= 1) || (settings.click === 'remove') && $('#repeated-sentences .sentence-box:visible').length === 0) {
                sentences[index].lastDone = today;
                sentences[index].done = s.count;
                //localStorage.setItem(`${s.title}-${today}`, 'done');
            } else {
                sentences[index].lastDone = null
            }

            localStorage.setItem('sentences', JSON.stringify(sentences))

            if (settings.click !== 'strike' && $('#repeated-sentences .sentence-box:visible').length <= 1) {
                $('#repeated-sentences').append('<div class="alert alert-success"><i class="bi bi-check-circle-fill text-success me-2"></i>لقد قمت اليوم بقراءة الذكر بعدد المرات المطلوب</div>')
            }

            scrollToFirstUndoneSentence()
        })
        $('#repeated-sentences').append(line)
    }

    $('#repeated-sentences').append(`<div class="mt-2">${s.aftertext || ''}</div>`)

    $('#sections').hide()
    $('#repeat-page').show()

    if (settings.click === 'strike')
        scrollToFirstUndoneSentence()

    setTimeout(() => {
        if (settings.click !== 'strike' && $('#repeated-sentences .sentence-box:visible').length === 0) {
            $('#repeated-sentences').append('<div class="alert alert-success"><i class="bi bi-check-circle-fill text-success me-2"></i>لقد قمت اليوم بقراءة الذكر بعدد المرات المطلوب</div>')
        }
    }, 100)
}

function backToHome() {
    $('#repeat-page').hide()
    $('#sections').show()
    currentIndex = null
    localStorage.setItem('currentIndex', currentIndex)
    updateDate()
}

function exportItem() {
    const key = 'sentences'
    const value = localStorage.getItem(key);
    if (value === null) {
        alert(`No item found for key: ${key}`);
        return;
    }

    const blob = new Blob([value], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = key + Date.now() + ".json"; // filename will be based on the key
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

function importItem() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("يرجى اختيار ملف للاستيراد");
        return;
    }

    if (file.name.indexOf('.json') === -1 || file.type.indexOf('json') === -1) {
        alert('الملف المختار غير صالح للاستيراد')
        return
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const value = e.target.result;

            let _s = JSON.parse(value)
            const key = "sentences"

            localStorage.setItem(key, value);
            sentences = _s
            alert(`تم استيراد الاذكار بنجاح`);
            setTimeout(() => {
                updateDate()
            }, 500)
        } catch (err) {
            alert("حصل خطأ أثناء استيراد الاذكار");
        }
    };

    reader.readAsText(file);
}

function scrollToFirstUndoneSentence() {
    window.scrollTo({ top: $('#repeated-sentences .sentence-box:not(.done)')?.first().offset().top - 100, behavior: 'smooth' })
}

// check day change every minute
setInterval(updateDate, 60000)
$(document).ready(function () {
    $('#theme').val(settings.theme || 'light')
    $('html').attr('data-bs-theme', settings.theme || 'light')
    updateDate(currentIndex)
})