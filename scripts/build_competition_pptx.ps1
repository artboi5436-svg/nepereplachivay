# Скрипт профессиональной генерации конкурсной презентации PowerPoint (.pptx)
# Для проекта «ТарифДетокс» (Demo Day / Стартап-батл)
$ErrorActionPreference = "Stop"
Stop-Process -Name POWERPNT -Force -ErrorAction SilentlyContinue
Add-Type -AssemblyName System.Runtime.InteropServices

function Color-Rgb($r, $g, $b) {
    return [int]($r + ($g * 256) + ($b * 65536))
}

$C_BG        = Color-Rgb 10 13 20       # #0A0D14 - Глубокий финтех-графит
$C_CARD      = Color-Rgb 17 22 34       # #111622 - Карточка
$C_CARD_ELEV = Color-Rgb 23 30 46       # #171E2E - Приподнятая карточка
$C_BORDER    = Color-Rgb 40 48 66       # Граница
$C_CORAL     = Color-Rgb 244 63 94      # #F43F5E - Неоновый коралл (Проблема)
$C_TEAL      = Color-Rgb 45 212 191     # #2DD4BF - Изумрудная бирюза (Решение)
$C_TEAL_DARK = Color-Rgb 13 148 136     # #0D9488
$C_CYAN      = Color-Rgb 56 189 248     # #38BDF8 - Лазурь (Технологии)
$C_AMBER     = Color-Rgb 245 158 11     # #F59E0B - Янтарный
$C_WHITE     = Color-Rgb 255 255 255    # Белый
$C_MUTED     = Color-Rgb 148 163 184    # #94A3B8 - Второстепенный текст
$C_DIM       = Color-Rgb 100 116 139    # #64748B - Приглушенный текст

$ppt = New-Object -ComObject PowerPoint.Application
try {
    Write-Host "Creating competition PowerPoint presentation (16:9)..."
    $pres = $ppt.Presentations.Add([Microsoft.Office.Core.MsoTriState]::msoFalse)
    $pres.PageSetup.SlideWidth = 960
    $pres.PageSetup.SlideHeight = 540

    function Setup-BaseSlide($slideNum, $categoryText, $categoryColor, $timingText, $slideIndexText, $titleText, $punchlineText, $speakerNotes) {
        $slide = $pres.Slides.Add($slideNum, 12) # ppLayoutBlank = 12

        # 1. Background
        $bg = $slide.Shapes.AddShape(1, 0, 0, 960, 540) # msoShapeRectangle
        $bg.Fill.Solid()
        $bg.Fill.ForeColor.RGB = $C_BG
        $bg.Line.Visible = [Microsoft.Office.Core.MsoTriState]::msoFalse

        # 2. Header: Tag & Timing
        $tag = $slide.Shapes.AddShape(5, 50, 24, 230, 26) # msoShapeRoundedRectangle
        $tag.Fill.Solid()
        $tag.Fill.ForeColor.RGB = $C_CARD
        $tag.Line.ForeColor.RGB = $categoryColor
        $tag.Line.Weight = 1
        $tr = $tag.TextFrame.TextRange
        $tr.Text = "$categoryText  •  $timingText"
        $tr.Font.Name = "Arial"
        $tr.Font.Size = 10
        $tr.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
        $tr.Font.Color.RGB = $categoryColor

        # Slide Number Badge
        $snum = $slide.Shapes.AddTextbox(1, 780, 24, 130, 26)
        $tr = $snum.TextFrame.TextRange
        $tr.Text = $slideIndexText
        $tr.Font.Name = "Arial"
        $tr.Font.Size = 10
        $tr.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
        $tr.Font.Color.RGB = $C_DIM
        $snum.TextFrame.TextRange.ParagraphFormat.Alignment = 3 # Right

        # 3. Main Title
        $tbTitle = $slide.Shapes.AddTextbox(1, 50, 52, 860, 44)
        $tbTitle.TextFrame.WordWrap = [Microsoft.Office.Core.MsoTriState]::msoTrue
        $tbTitle.TextFrame.MarginLeft = 0
        $tbTitle.TextFrame.MarginTop = 0
        $tbTitle.TextFrame.MarginRight = 0
        $tbTitle.TextFrame.MarginBottom = 0
        $tr = $tbTitle.TextFrame.TextRange
        $tr.Text = $titleText
        $tr.Font.Name = "Arial"
        $tr.Font.Size = 22
        $tr.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
        $tr.Font.Color.RGB = $C_WHITE

        # 4. Punchline
        if ($punchlineText) {
            $tbPunch = $slide.Shapes.AddTextbox(1, 50, 102, 860, 30)
            $tbPunch.TextFrame.WordWrap = [Microsoft.Office.Core.MsoTriState]::msoTrue
            $tbPunch.TextFrame.MarginLeft = 0
            $tbPunch.TextFrame.MarginTop = 0
            $tbPunch.TextFrame.MarginRight = 0
            $tbPunch.TextFrame.MarginBottom = 0
            $tr = $tbPunch.TextFrame.TextRange
            $tr.Text = $punchlineText
            $tr.Font.Name = "Arial"
            $tr.Font.Size = 13
            $tr.Font.Color.RGB = $C_MUTED
        }

        # 6. Speaker Notes
        if ($speakerNotes) {
            $notesShape = $slide.NotesPage.Shapes.Item(2)
            if ($notesShape -and $notesShape.HasTextFrame) {
                $notesShape.TextFrame.TextRange.Text = "ТАЙМИНГ: $timingText`n`nРЕЧЬ ДОКЛАДЧИКА:`n$speakerNotes"
            }
        }

        return $slide
    }

    # Вспомогательная функция для добавления структурированного текста в карточки
    function Add-CardContent($shape, $items, $align = 1, $valign = 1) {
        $shape.TextFrame.VerticalAnchor = $valign
        $shape.TextFrame.WordWrap = [Microsoft.Office.Core.MsoTriState]::msoTrue
        $shape.TextFrame.MarginLeft = 18
        $shape.TextFrame.MarginRight = 18
        $shape.TextFrame.MarginTop = 18
        $shape.TextFrame.MarginBottom = 18

        $tr = $shape.TextFrame.TextRange
        $fullText = ($items | ForEach-Object { $_.Text }) -join "`r"
        $tr.Text = $fullText

        for ($i = 0; $i -lt $items.Count; $i++) {
            $p = $tr.Paragraphs($i + 1)
            $item = $items[$i]
            $p.Font.Name = "Arial"
            $p.Font.Size = $item.Size
            $p.Font.Bold = if ($item.Bold) { [Microsoft.Office.Core.MsoTriState]::msoTrue } else { [Microsoft.Office.Core.MsoTriState]::msoFalse }
            if ($item.Color) { $p.Font.Color.RGB = $item.Color }
            if ($item.SpaceAfter -ne $null) { $p.ParagraphFormat.SpaceAfter = $item.SpaceAfter } else { $p.ParagraphFormat.SpaceAfter = 6 }
            $p.ParagraphFormat.Alignment = if ($item.Align) { $item.Align } else { $align }
        }
    }

    # =========================================================================
    # СЛАЙД 1: HOOK & НАЗВАНИЕ (0:00 – 0:20)
    # =========================================================================
    $s1 = Setup-BaseSlide 1 "DEMO DAY & BATTLE" $C_CYAN "0:00 – 0:20" "СЛАЙД 01 / 10" `
        "ТАРИФДЕТОКС: СЕРВИС ОСВОБОЖДЕНИЯ ОТ СКРЫТЫХ ПЕРЕПЛАТ" `
        "Первый независимый арбитр потребителя в сфере телекома и цифровых сервисов без регистрации" `
        "Здравствуйте, уважаемые члены жюри! Меня зовут [Имя]. Прямо сейчас, пока вы слушаете это приветствие, жители России и новых регионов переплачивают более пятидесяти миллионов рублей за услуги связи и подписки, которыми они не пользуются. Мы создали ТарифДетокс — сервис честного освобождения граждан от скрытых переплат."

    # Hero Shield Box
    $shieldBox = $s1.Shapes.AddShape(5, 50, 155, 860, 130)
    $shieldBox.Fill.Solid()
    $shieldBox.Fill.ForeColor.RGB = $C_CARD
    $shieldBox.Line.ForeColor.RGB = $C_TEAL
    $shieldBox.Line.Weight = 2
    Add-CardContent $shieldBox @(
        @{ Text = "ТАРИФДЕТОКС"; Size = 28; Bold = $true; Color = $C_TEAL; SpaceAfter = 8; Align = 2 },
        @{ Text = "Честный аудит мобильной связи, домашнего интернета и подписок"; Size = 15; Bold = $false; Color = $C_WHITE; SpaceAfter = 4; Align = 2 }
    ) 2 3

    # Live Odometer Box
    $odoBox = $s1.Shapes.AddShape(5, 100, 310, 760, 145)
    $odoBox.Fill.Solid()
    $odoBox.Fill.ForeColor.RGB = Color-Rgb 28 12 18
    $odoBox.Line.ForeColor.RGB = $C_CORAL
    $odoBox.Line.Weight = 2
    Add-CardContent $odoBox @(
        @{ Text = "● ЖИВАЯ УТЕЧКА ДЕНЕГ В СТРАНЕ ПРЯМО СЕЙЧАС (В МАСШТАБЕ РФ)"; Size = 12; Bold = $true; Color = $C_CORAL; SpaceAfter = 4; Align = 2 },
        @{ Text = "52 384 120 ₽"; Size = 40; Bold = $true; Color = $C_CORAL; SpaceAfter = 4; Align = 2 },
        @{ Text = "Скрытые переплаты граждан за услуги связи и подписки за время 3-минутного питча"; Size = 12; Bold = $false; Color = $C_MUTED; SpaceAfter = 0; Align = 2 }
    ) 2 3

    # =========================================================================
    # СЛАЙД 2: ПРОБЛЕМА (0:20 – 0:45)
    # =========================================================================
    $s2 = Setup-BaseSlide 2 "ПРОБЛЕМА РЫНКА" $C_CORAL "0:20 – 0:45" "СЛАЙД 02 / 10" `
        "МАРКЕТИНГОВЫЙ ЛАБИРИНТ: «НАЛОГ НА НЕВНИМАТЕЛЬНОСТЬ»" `
        "Ежемесячные счета стали запутанной паутиной скрытых автопродлений, архивных тарифов и ловушек" `
        "В чем корень проблемы? Счета превратились в лабиринт маркетологов. 68% абонентов годами переплачивают на архивных тарифах, потому что операторы тихо поднимают цены. Средняя семья теряет 18 000 рублей в год на забытых подписках и вечной аренде копеечных роутеров. Итог — минус 21 600 рублей в год из каждого семейного бюджета."

    # 3 Cards
    $cardsData = @(
        @{ Num = "68%"; Title = "Архивное рабство"; Desc = "Абоненты годами сидят на старых невыгодных тарифах, переплачивая до +40% каждый месяц." },
        @{ Num = "18 000 ₽"; Title = "Паразитные «хвосты»"; Desc = "Среднегодовая потеря семьи на забытых онлайн-кинотеатрах, книгах и платной аренде роутеров." },
        @{ Num = "1 ₽ / мес"; Title = "Маркетинговые капканы"; Desc = "Промо-периоды с автоповышением цены в 5 раз, навязанные страховки при автокредитах и комиссии MNP." }
    )

    for ($i = 0; $i -lt 3; $i++) {
        $x = 50 + ($i * 295)
        $c = $s2.Shapes.AddShape(5, $x, 155, 270, 205)
        $c.Fill.Solid()
        $c.Fill.ForeColor.RGB = $C_CARD
        $c.Line.ForeColor.RGB = Color-Rgb 100 25 35
        $c.Line.Weight = 1.5
        Add-CardContent $c @(
            @{ Text = $cardsData[$i].Num; Size = 34; Bold = $true; Color = $C_CORAL; SpaceAfter = 8; Align = 1 },
            @{ Text = $cardsData[$i].Title; Size = 16; Bold = $true; Color = $C_WHITE; SpaceAfter = 8; Align = 1 },
            @{ Text = $cardsData[$i].Desc; Size = 11; Bold = $false; Color = $C_MUTED; SpaceAfter = 0; Align = 1 }
        ) 1 1
    }

    # Collapse Banner
    $colBox = $s2.Shapes.AddShape(5, 50, 380, 860, 85)
    $colBox.Fill.Solid()
    $colBox.Fill.ForeColor.RGB = Color-Rgb 28 12 18
    $colBox.Line.ForeColor.RGB = $C_CORAL
    $colBox.Line.Weight = 2
    Add-CardContent $colBox @(
        @{ Text = "⚠️ СОВОКУПНАЯ ПРЯМАЯ ПОТЕРЯ ДОМОХОЗЯЙСТВА В ГОД:"; Size = 12; Bold = $false; Color = $C_MUTED; SpaceAfter = 4; Align = 2 },
        @{ Text = "−21 600 ₽ / ГОД ИЗ СЕМЕЙНОГО БЮДЖЕТА"; Size = 22; Bold = $true; Color = $C_CORAL; SpaceAfter = 0; Align = 2 }
    ) 2 3

    # =========================================================================
    # СЛАЙД 3: РЕШЕНИЕ (0:45 – 1:10)
    # =========================================================================
    $s3 = Setup-BaseSlide 3 "РЕШЕНИЕ ПРОЕКТА" $C_TEAL "0:45 – 1:10" "СЛАЙД 03 / 10" `
        "НЕ АГРЕГАТОР. НЕ ВИТРИНА ПРОДАЖ. НЕЗАВИСИМЫЙ АРБИТР." `
        "Мы не продаем людям новые SIM-карты ради комиссий — мы защищаем личный бюджет граждан" `
        "Как мы это решаем? ТарифДетокс принципиально НЕ витрина продаж и НЕ партнерский агрегатор. Мы независимый арбитр. Наше первое правило — расчет честного TCO на 12 месяцев со всеми акциями и скрытыми платежами. Второе — если ваш тариф лучший, мы прямо скажем: Не меняйте! И третье — 100% приватность: ни регистраций, ни номеров телефонов, расчет строго в браузере."

    $rulesData = @(
        @{ RNum = "ЗОЛОТОЕ ПРАВИЛО 01"; Title = "Честный TCO на 12 месяцев"; Desc = "Считаем полную стоимость за 12 месяцев: акции, базовые тарифы, аренду роутера и скрытые подключения."; Foot = "✓ Без ложных иллюзий экономии" },
        @{ RNum = "ЗОЛОТОЕ ПРАВИЛО 02"; Title = "Абсолютная честность"; Desc = "Если текущий тариф пользователя лучший — сервис прямо говорит: «Не меняйте оператора!». Выдаем скрипт торга для скидки 30%."; Foot = "✓ Выгода пользователя превыше всего" },
        @{ RNum = "ЗОЛОТОЕ ПРАВИЛО 03"; Title = "100% Privacy by Design"; Desc = "Ноль номеров телефонов, ноль смс, ноль регистраций. Все математические расчеты производятся прямо в браузере (152-ФЗ)."; Foot = "✓ Полная анонимность клиента" }
    )

    for ($i = 0; $i -lt 3; $i++) {
        $x = 50 + ($i * 295)
        $c = $s3.Shapes.AddShape(5, $x, 155, 270, 305)
        $c.Fill.Solid()
        $c.Fill.ForeColor.RGB = $C_CARD
        $c.Line.ForeColor.RGB = $C_TEAL
        $c.Line.Weight = 1.5
        Add-CardContent $c @(
            @{ Text = $rulesData[$i].RNum; Size = 10; Bold = $true; Color = $C_TEAL; SpaceAfter = 6 },
            @{ Text = $rulesData[$i].Title; Size = 16; Bold = $true; Color = $C_WHITE; SpaceAfter = 8 },
            @{ Text = $rulesData[$i].Desc; Size = 11; Bold = $false; Color = $C_MUTED; SpaceAfter = 14 },
            @{ Text = $rulesData[$i].Foot; Size = 10; Bold = $true; Color = $C_CYAN; SpaceAfter = 0 }
        ) 1 1
    }

    # =========================================================================
    # СЛАЙД 4: ДЕМО СПЛИТ-СКРИН (1:10 – 1:40)
    # =========================================================================
    $s4 = Setup-BaseSlide 4 "ПОЛЬЗОВАТЕЛЬСКИЙ ОПЫТ" $C_TEAL "1:10 – 1:40" "СЛАЙД 04 / 10" `
        "ИНТЕРАКТИВНЫЙ ДЕТОКС: 2 МИНУТЫ ДО РЕАЛЬНОЙ ВЫГОДЫ" `
        "Никаких сложных форм — пошаговый мастер мгновенно выявляет паразитные списания" `
        "Взгляните, как работает сервис на практике. Пользователь проходит 3 простых шага ровно за 2 минуты: выбирает мобильную связь с опцией Безлимита, скорость интернета и отмечает свои подписки из базы 27 сервисов. Алгоритм мгновенно подсвечивает, что человек платит 2100 рублей в месяц, а с нашими рекомендациями будет платить 1150. Чистая выгода — 11 400 рублей в год прямо на руки."

    # Left: Steps List
    $stepsData = @(
        @{ Num = "ШАГ 1"; Title = "Мобильная связь (24 тарифа + Безлимит)"; Desc = "Ввод минут и ГБ или выбор безлимита. Алгоритм близких альтернатив." },
        @{ Num = "ШАГ 2"; Title = "Домашний интернет и ТВ (до 500 Мбит/с)"; Desc = "Аудит платы за роутер (150 ₽/мес) и сравнение с GPON региона." },
        @{ Num = "ШАГ 3"; Title = "Мультиселектор 27 подписок РФ и ЛНР"; Desc = "Детекция дубликатов (Кинопоиск + Яндекс Плюс, книги и облака)." }
    )

    for ($i = 0; $i -lt 3; $i++) {
        $y = 155 + ($i * 100)
        $st = $s4.Shapes.AddShape(5, 50, $y, 480, 85)
        $st.Fill.Solid()
        $st.Fill.ForeColor.RGB = $C_CARD
        $st.Line.ForeColor.RGB = $C_TEAL
        $st.Line.Weight = 1
        Add-CardContent $st @(
            @{ Text = "$($stepsData[$i].Num): $($stepsData[$i].Title)"; Size = 13; Bold = $true; Color = $C_TEAL; SpaceAfter = 4 },
            @{ Text = $stepsData[$i].Desc; Size = 11; Bold = $false; Color = $C_MUTED; SpaceAfter = 0 }
        ) 1 1
    }

    # Right: Result Card
    $resCard = $s4.Shapes.AddShape(5, 560, 155, 350, 285)
    $resCard.Fill.Solid()
    $resCard.Fill.ForeColor.RGB = Color-Rgb 14 26 36
    $resCard.Line.ForeColor.RGB = $C_TEAL
    $resCard.Line.Weight = 2
    Add-CardContent $resCard @(
        @{ Text = "✦ ИТОГОВЫЙ ОТЧЕТ АУДИТА ✦"; Size = 11; Bold = $true; Color = $C_TEAL; SpaceAfter = 12; Align = 2 },
        @{ Text = "Было в месяц:"; Size = 10; Bold = $false; Color = $C_MUTED; SpaceAfter = 2; Align = 2 },
        @{ Text = "2 100 ₽"; Size = 20; Bold = $true; Color = $C_CORAL; SpaceAfter = 10; Align = 2 },
        @{ Text = "Стало после детокса:"; Size = 10; Bold = $false; Color = $C_MUTED; SpaceAfter = 2; Align = 2 },
        @{ Text = "1 150 ₽ / мес"; Size = 24; Bold = $true; Color = $C_TEAL; SpaceAfter = 12; Align = 2 },
        @{ Text = "ЧИСТАЯ ПОДТВЕРЖДЕННАЯ ВЫГОДА:"; Size = 10; Bold = $false; Color = $C_MUTED; SpaceAfter = 2; Align = 2 },
        @{ Text = "+11 400 ₽ / ГОД"; Size = 24; Bold = $true; Color = $C_WHITE; SpaceAfter = 0; Align = 2 }
    ) 2 3

    # =========================================================================
    # СЛАЙД 5: АЛГОРИТМЫ CALCULATOR.JS (1:40 – 2:05)
    # =========================================================================
    $s5 = Setup-BaseSlide 5 "ТЕХНОЛОГИЧЕСКОЕ НОУ-ХАУ" $C_CYAN "1:40 – 2:05" "СЛАЙД 05 / 10" `
        "ИНЖЕНЕРНОЕ ЯДРО: 3 АЛГОРИТМА CALCULATOR.JS" `
        "Математически строгий расчет TCO, близости тарифов и графа пересечений подписок" `
        "В основе проекта — инженерное ядро из 3 строгих математических алгоритмов в файле calculator.js. Первый — формула TCO 12. Второй — Proximity Score: если идеального дешевого тарифа под критерии нет, векторный алгоритм ранжирует наиболее близкие решения. Третий — Subscription Overlap Graph, выявляющий скрытые паразитные подписки на лету."

    $algosData = @(
        @{ Label = "ИНЖЕНЕРНОЕ ЯДРО • 01"; Code = "TCO = Setup + (Promo×N) + (Base×(12-N)) + (Hw×12)"; Title = "Формула TCO 12"; Desc = "Учитывает разовые траты на подключение, период скидки, базовый тариф и постоянную аренду оборудования." },
        @{ Label = "ИНЖЕНЕРНОЕ ЯДРО • 02"; Code = "Score = W_gb·ΔGB + W_min·ΔMin − W_p·Price"; Title = "Proximity Score"; Desc = "Если точного тарифа дешевле нет, алгоритм вычисляет расстояние по параметрам и выдает 3 лучших близких варианта." },
        @{ Label = "ИНЖЕНЕРНОЕ ЯДРО • 03"; Code = "detectOverlap(ActiveEcosystems, PaidServices)"; Title = "Overlap Graph"; Desc = "Детектирует поглощение сервисов: если у вас активен Яндекс Плюс, система помечает Кинопоиск как 100% дубль." }
    )

    for ($i = 0; $i -lt 3; $i++) {
        $x = 50 + ($i * 295)
        $c = $s5.Shapes.AddShape(5, $x, 155, 270, 305)
        $c.Fill.Solid()
        $c.Fill.ForeColor.RGB = $C_CARD
        $c.Line.ForeColor.RGB = $C_CYAN
        $c.Line.Weight = 1.5
        Add-CardContent $c @(
            @{ Text = $algosData[$i].Label; Size = 10; Bold = $true; Color = $C_CYAN; SpaceAfter = 6 },
            @{ Text = $algosData[$i].Title; Size = 16; Bold = $true; Color = $C_WHITE; SpaceAfter = 8 },
            @{ Text = $algosData[$i].Code; Size = 10; Bold = $true; Color = $C_TEAL; SpaceAfter = 10 },
            @{ Text = $algosData[$i].Desc; Size = 11; Bold = $false; Color = $C_MUTED; SpaceAfter = 0 }
        ) 1 1
    }

    # =========================================================================
    # СЛАЙД 6: КЕЙС ЛНР (2:05 – 2:30)
    # =========================================================================
    $s6 = Setup-BaseSlide 6 "СОЦИАЛЬНАЯ МИССИЯ" $C_TEAL "2:05 – 2:30" "СЛАЙД 06 / 10" `
        "ОСТРЫЙ СОЦИАЛЬНЫЙ КЕЙС: РЫНОК СВЯЗИ ЛНР И НОВЫХ РЕГИОНОВ" `
        "Интеграция жителей новых субъектов РФ в единое прозрачное телеком-пространство страны" `
        "Отдельная гордость нашего проекта — решение острой социальной проблемы в новых регионах, в частности в ЛНР. Рынок связи там активно перестраивается. Мы оцифровали полную базу: 24 мобильных тарифа МКС, +7Телеком, билайн и Миранды, а также 22 тарифа провайдеров домашнего интернета Луганска, Алчевска, Свердловска и Северодонецка. Жители получают прозрачные ответы по роумингу, MNP и GPON."

    $lnrData = @(
        @{ Icon = "📱"; Title = "База мобильных тарифов (+7 959)"; Desc = "МКС, +7Телеком, билайн, Миранда-медиа и СберМобайл с учетом звонков по всей РФ." },
        @{ Icon = "🌐"; Title = "Провайдеры домашнего интернета"; Desc = "Луганет, ЛДС, Мегалайн, Магеал, Холинет, ЛТК по городам: Луганск, Алчевск, Свердловск, Северодонецк." },
        @{ Icon = "⚖️"; Title = "Юридическая ясность без мифов"; Desc = "Разъяснения по статусу переноса номера MNP, оптическим терминалам GPON и честной скорости в МКД и частном секторе." }
    )

    for ($i = 0; $i -lt 3; $i++) {
        $y = 155 + ($i * 100)
        $st = $s6.Shapes.AddShape(5, 50, $y, 520, 85)
        $st.Fill.Solid()
        $st.Fill.ForeColor.RGB = $C_CARD
        $st.Line.ForeColor.RGB = $C_BORDER
        $st.Line.Weight = 1
        Add-CardContent $st @(
            @{ Text = "$($lnrData[$i].Icon)  $($lnrData[$i].Title)"; Size = 13; Bold = $true; Color = $C_WHITE; SpaceAfter = 4 },
            @{ Text = $lnrData[$i].Desc; Size = 10; Bold = $false; Color = $C_MUTED; SpaceAfter = 0 }
        ) 1 1
    }

    # Stats on right
    $st1 = $s6.Shapes.AddShape(5, 600, 155, 310, 135)
    $st1.Fill.Solid()
    $st1.Fill.ForeColor.RGB = Color-Rgb 14 26 36
    $st1.Line.ForeColor.RGB = $C_CYAN
    $st1.Line.Weight = 2
    Add-CardContent $st1 @(
        @{ Text = "24"; Size = 44; Bold = $true; Color = $C_CYAN; SpaceAfter = 4; Align = 2 },
        @{ Text = "Мобильных тарифа региона в базе"; Size = 12; Bold = $true; Color = $C_WHITE; SpaceAfter = 0; Align = 2 }
    ) 2 3

    $st2 = $s6.Shapes.AddShape(5, 600, 305, 310, 135)
    $st2.Fill.Solid()
    $st2.Fill.ForeColor.RGB = Color-Rgb 14 26 36
    $st2.Line.ForeColor.RGB = $C_TEAL
    $st2.Line.Weight = 2
    Add-CardContent $st2 @(
        @{ Text = "22"; Size = 44; Bold = $true; Color = $C_TEAL; SpaceAfter = 4; Align = 2 },
        @{ Text = "Тарифа домашнего интернета ЛНР"; Size = 12; Bold = $true; Color = $C_WHITE; SpaceAfter = 0; Align = 2 }
    ) 2 3

    # =========================================================================
    # СЛАЙД 7: АРСЕНАЛ ЗАЩИТЫ (2:30 – 2:50)
    # =========================================================================
    $s7 = Setup-BaseSlide 7 "ЮРИДИЧЕСКИЙ ЩИТ" $C_CYAN "2:30 – 2:50" "СЛАЙД 07 / 10" `
        "АРСЕНАЛ ЗАЩИТЫ: ОТ РАСЧЕТА — К РЕАЛЬНЫМ ДЕНЬГАМ" `
        "Готовые юридические шаблоны и переговорные сценарии прямого действия в один клик" `
        "Мы не просто считаем цифры — мы даем человеку юридическое оружие. В сервис встроен Скрипт торга «Хочу уйти», позволяющий выбить 30-50% скидки у своего же оператора. Встроены пошаговые инструкции по MNP по 46-й статье ФЗ «О связи», шаблоны претензий на возврат по 32-й статье ЗоЗПП и генератор напоминаний в календарь смартфона за 3 дня до конца акций."

    $shieldData = @(
        @{ Tag = "ПЕРЕГОВОРЫ"; Title = "Скрипт «Хочу уйти»"; Desc = "Сценарий звонка оператору: получение скидки 30–50% без смены SIM-карты и номера." },
        @{ Tag = "ФЗ «О СВЯЗИ» СТ. 46"; Title = "Гайд по смене MNP"; Desc = "Защита от отказа в переносе номера: как составить заявление и пресечь комиссии." },
        @{ Tag = "ЗОЗПП РФ СТ. 32"; Title = "Претензия на возврат"; Desc = "Шаблон требования возврата денег за навязанные скрытые услуги, автопродления и страховки." },
        @{ Tag = "КАЛЕНДАРЬ"; Title = "Экспорт в .ics"; Desc = "Файл напоминания в календарь за 3 дня до конца промо-периода для своевременной отмены." }
    )

    for ($i = 0; $i -lt 4; $i++) {
        $x = 50 + ($i * 220)
        $c = $s7.Shapes.AddShape(5, $x, 155, 200, 305)
        $c.Fill.Solid()
        $c.Fill.ForeColor.RGB = $C_CARD
        $c.Line.ForeColor.RGB = $C_CYAN
        $c.Line.Weight = 1.5
        Add-CardContent $c @(
            @{ Text = $shieldData[$i].Tag; Size = 9; Bold = $true; Color = $C_AMBER; SpaceAfter = 6 },
            @{ Text = $shieldData[$i].Title; Size = 15; Bold = $true; Color = $C_WHITE; SpaceAfter = 8 },
            @{ Text = $shieldData[$i].Desc; Size = 11; Bold = $false; Color = $C_MUTED; SpaceAfter = 0 }
        ) 1 1
    }

    # =========================================================================
    # СЛАЙД 8: АРХИТЕКТУРА И ЗРЕЛОСТЬ (2:50 – 3:10)
    # =========================================================================
    $s8 = Setup-BaseSlide 8 "ИНЖЕНЕРНАЯ ЗРЕЛОСТЬ" $C_TEAL "2:50 – 3:10" "СЛАЙД 08 / 10" `
        "АРХИТЕКТУРА ЗРЕЛОГО ПРОДУКТА: MVP ГОТОВ НА 100%" `
        "Отказоустойчивый, сверхбыстрый и полностью автономный стек без тяжелых фреймворков" `
        "Перед вами не презентация концепта или идея в Figma. Перед вами зрелый работающий продукт с готовностью 100%. Наш стек — Zero-Dependency: чистый HTML5 и современный Vanilla JS. Сайт открывается за 0.2 секунды даже при слабом 3G. Он полностью автономен, покрыт unit-тестами через Node Test Runner и снабжен валидатором целостности баз."

    $techData = @(
        @{ Metric = "< 0.2 с"; Title = "Zero-Dependency"; Desc = "Чистый стек HTML5 + ES6 Vanilla JS. Мгновенная загрузка даже при слабом 3G." },
        @{ Metric = "Offline"; Title = "100% Автономность"; Desc = "Работает локально даже при полном отсутствии интернета и из файла file://." },
        @{ Metric = "100%"; Title = "Unit Test Coverage"; Desc = "Тесты нативного Node Test Runner покрывают все граничные сценарии акций и дублей." },
        @{ Metric = "CI / CD"; Title = "Автовалидатор данных"; Desc = "Скрипты валидации гарантируют актуальность цен и целостность JSON-баз региона." }
    )

    for ($i = 0; $i -lt 4; $i++) {
        $x = 50 + ($i * 220)
        $c = $s8.Shapes.AddShape(5, $x, 155, 200, 305)
        $c.Fill.Solid()
        $c.Fill.ForeColor.RGB = $C_CARD
        $c.Line.ForeColor.RGB = $C_TEAL
        $c.Line.Weight = 1.5
        Add-CardContent $c @(
            @{ Text = $techData[$i].Metric; Size = 28; Bold = $true; Color = $C_TEAL; SpaceAfter = 6 },
            @{ Text = $techData[$i].Title; Size = 15; Bold = $true; Color = $C_WHITE; SpaceAfter = 8 },
            @{ Text = $techData[$i].Desc; Size = 11; Bold = $false; Color = $C_MUTED; SpaceAfter = 0 }
        ) 1 1
    }

    # =========================================================================
    # СЛАЙД 9: МАСШТАБИРОВАНИЕ (3:10 – 3:30)
    # =========================================================================
    $s9 = Setup-BaseSlide 9 "МАСШТАБИРОВАНИЕ" $C_CYAN "3:10 – 3:30" "СЛАЙД 09 / 10" `
        "МАСШТАБ И ЭФФЕКТ: ВОЗВРАТ МИЛЛИАРДОВ В СЕМЬИ" `
        "Огромный социальный импакт и четкая дорожная карта технологического развития" `
        "Каков социально-экономический эффект? До 20 000 рублей сэкономленных денег на домохозяйство ежегодно. В масштабе страны это возврат миллиардов рублей в реальную экономику семей. Наш план масштабирования включает внедрение безопасного AI-сканера детализаций прямо в браузере через OCR, превентивного Telegram-бота и встраиваемого виджета для региональных порталов."

    $roadData = @(
        @{ Phase = "ФАЗА 1 (ТЕКУЩИЙ MVP)"; Title = "Калькулятор 50+ тарифов"; Desc = "Оцифрованная база связи, домашнего интернета и 27 подписок РФ и ЛНР, скрипты торга и TCO 12."; Status = "✓ Запущено и работает онлайн" },
        @{ Phase = "ФАЗА 2 (Q1–Q2 2027)"; Title = "In-Browser OCR AI-сканер"; Desc = "Локальная нейросеть в браузере: распознает PDF-счета и находит списания без отправки фото на сервер (152-ФЗ)."; Status = "✦ Полная приватность 152-ФЗ" },
        @{ Phase = "ФАЗА 3 (Q3 2027)"; Title = "Виджет для Госуслуг"; Desc = "Бесплатный встраиваемый модуль «ТарифДетокс» для региональных МФЦ, банков и медиа о личных финансах."; Status = "✦ Охват: 10 000 000+ граждан" }
    )

    for ($i = 0; $i -lt 3; $i++) {
        $x = 50 + ($i * 295)
        $c = $s9.Shapes.AddShape(5, $x, 155, 270, 305)
        $c.Fill.Solid()
        $c.Fill.ForeColor.RGB = $C_CARD
        $c.Line.ForeColor.RGB = $C_CYAN
        $c.Line.Weight = 1.5
        Add-CardContent $c @(
            @{ Text = $roadData[$i].Phase; Size = 10; Bold = $true; Color = $C_CYAN; SpaceAfter = 6 },
            @{ Text = $roadData[$i].Title; Size = 16; Bold = $true; Color = $C_WHITE; SpaceAfter = 8 },
            @{ Text = $roadData[$i].Desc; Size = 11; Bold = $false; Color = $C_MUTED; SpaceAfter = 14 },
            @{ Text = $roadData[$i].Status; Size = 10; Bold = $true; Color = $C_TEAL; SpaceAfter = 0 }
        ) 1 1
    }

    # =========================================================================
    # СЛАЙД 10: ФИНАЛ & QR-КОД (3:30 – 3:50)
    # =========================================================================
    $s10 = Setup-BaseSlide 10 "ФИНАЛ ВЫСТУПЛЕНИЯ" $C_TEAL "3:30 – 3:50" "СЛАЙД 10 / 10" `
        "ПОЧЕМУ «ТАРИФДЕТОКС» ПОБЕЖДАЕТ НА DEMO DAY" `
        "Мы создали инструмент, который не продает лишнее, а защищает заработанные деньги граждан" `
        "В заключение: почему ТарифДетокс должен занять первое место? Потому что мы не продаем людям лишнее — мы защищаем их заработанные деньги. Наш сервис готов, протестирован и опубликован прямо сейчас. Наведите камеру смартфона на QR-код и убедитесь сами за 2 минуты. Спасибо за внимание, готов ответить на ваши вопросы!"

    # Left: Quote & Badges
    $quoteBox = $s10.Shapes.AddShape(5, 50, 155, 480, 305)
    $quoteBox.Fill.Solid()
    $quoteBox.Fill.ForeColor.RGB = $C_CARD
    $quoteBox.Line.ForeColor.RGB = $C_TEAL
    $quoteBox.Line.Weight = 2
    Add-CardContent $quoteBox @(
        @{ Text = "«Мы создали сервис, который не продает лишнее, а защищает деньги граждан каждый месяц»."; Size = 15; Bold = $true; Color = $C_WHITE; SpaceAfter = 8 },
        @{ Text = "Продукт готов, протестирован и работает прямо сейчас в открытом доступе для всей России и ЛНР."; Size = 11; Bold = $false; Color = $C_MUTED; SpaceAfter = 14 },
        @{ Text = "✓ 100% Готовый рабочий MVP"; Size = 12; Bold = $true; Color = $C_TEAL; SpaceAfter = 6 },
        @{ Text = "✓ Открытый исходный код"; Size = 12; Bold = $true; Color = $C_CYAN; SpaceAfter = 6 },
        @{ Text = "✓ Проверено на реальных домохозяйствах"; Size = 12; Bold = $true; Color = $C_AMBER; SpaceAfter = 0 }
    ) 1 1

    # Right: QR Code Card
    $qrCard = $s10.Shapes.AddShape(5, 570, 155, 340, 305)
    $qrCard.Fill.Solid()
    $qrCard.Fill.ForeColor.RGB = Color-Rgb 14 26 36
    $qrCard.Line.ForeColor.RGB = $C_TEAL
    $qrCard.Line.Weight = 2

    # QR Text Top
    $qrTop = $s10.Shapes.AddTextbox(1, 570, 168, 340, 28)
    $tr = $qrTop.TextFrame.TextRange
    $tr.Text = "НАВЕДИТЕ КАМЕРУ СМАРТФОНА"
    $tr.Font.Name = "Arial"
    $tr.Font.Size = 12
    $tr.Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $tr.Font.Color.RGB = $C_WHITE
    $tr.ParagraphFormat.Alignment = 2

    # Insert QR Image
    $qrImgPath = (Resolve-Path "assets/qr-site.png").Path
    if (Test-Path $qrImgPath) {
        $qrPic = $s10.Shapes.AddPicture($qrImgPath, [Microsoft.Office.Core.MsoTriState]::msoFalse, [Microsoft.Office.Core.MsoTriState]::msoTrue, 660, 202, 160, 160)
    }

    # QR Text Bottom
    $qrBot = $s10.Shapes.AddTextbox(1, 570, 385, 340, 55)
    $tr = $qrBot.TextFrame.TextRange
    $tr.Text = "artboi5436-svg.github.io/nepereplachivay`n(протестируйте прямо сейчас со смартфона)"
    $tr.Font.Name = "Arial"
    $tr.Paragraphs(1).Font.Size = 11
    $tr.Paragraphs(1).Font.Bold = [Microsoft.Office.Core.MsoTriState]::msoTrue
    $tr.Paragraphs(1).Font.Color.RGB = $C_TEAL
    $tr.Paragraphs(2).Font.Size = 10
    $tr.Paragraphs(2).Font.Color.RGB = $C_MUTED
    $tr.ParagraphFormat.Alignment = 2

    # =========================================================================
    # СОХРАНЕНИЕ ПРЕЗЕНТАЦИЙ (competition_pitch.pptx и presentation.pptx)
    # =========================================================================
    $outCompetition = (Join-Path (Get-Location) "competition_pitch.pptx")
    $outPresentation = (Join-Path (Get-Location) "presentation.pptx")

    if (Test-Path $outCompetition) { Remove-Item $outCompetition -Force }
    $pres.SaveAs($outCompetition)
    Write-Host "Saved: competition_pitch.pptx ($((Get-Item $outCompetition).Length) bytes)"

    if (Test-Path $outPresentation) { Remove-Item $outPresentation -Force }
    $pres.SaveCopyAs($outPresentation)
    Write-Host "Saved: presentation.pptx ($((Get-Item $outPresentation).Length) bytes)"

    $pres.Close()
    Write-Host "Presentation generation completed successfully!"
} finally {
    $ppt.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($ppt) | Out-Null
}
