@echo off
setlocal enabledelayedexpansion

REM Set paths
set "video_dir=E:\Buddha\yinxin_tai\楞严要解"
set "music_clip=E:\Buddha\yinxin_tai\music30s.m4a"
set "output_dir=%video_dir%\output"

REM Create output directory if it doesn't exist
if not exist "%output_dir%" mkdir "%output_dir%"

REM Loop through all video files in the directory
for %%F in ("%video_dir%\*.mp4") do (
    set "filename=%%~nF"
    echo Processing: %%F

    REM Extract video without audio
    ffmpeg -i "%%F" -an -c:v copy "%output_dir%\!filename!_video.mp4"

    REM Extract original audio starting from 30s
    ffmpeg -i "%%F" -ss 00:00:30 -c:a aac -b:a 128k "%output_dir%\!filename!_tail.aac"

    REM Concatenate music30s.m4a and tail audio
    echo file '%music_clip%' > "%output_dir%\concat_list.txt"
    echo file '!filename!_tail.aac' >> "%output_dir%\concat_list.txt"

    ffmpeg -f concat -safe 0 -i "%output_dir%\concat_list.txt" -c copy "%output_dir%\!filename!_final_audio.aac"

    REM Combine video and new audio
    ffmpeg -i "%output_dir%\!filename!_video.mp4" -i "%output_dir%\!filename!_final_audio.aac" -c:v copy -map 0:v:0 -map 1:a:0 -shortest "%output_dir%\!filename!_replaced.mp4"

    REM Cleanup intermediate files
    del "%output_dir%\!filename!_video.mp4"
    del "%output_dir%\!filename!_tail.aac"
    del "%output_dir%\!filename!_final_audio.aac"
    del "%output_dir%\concat_list.txt"
)

echo All videos processed.
pause