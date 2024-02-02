import pywhatkit as pwk
import time 
import pyautogui
from pynput.keyboard import Key, Controller
import sys
keyboard = Controller()
print("Hi, imported..")
print("Hi, it's working..")
print("str(sys.argv[1]): ", str(sys.argv[1]))
print("str(sys.argv[2]): ", str(sys.argv[2]))
pwk.sendwhatmsg_instantly(
            phone_no="+2"+str(sys.argv[1]), 
            message=str(sys.argv[2]),
        )
time.sleep(10)
pyautogui.click()
time.sleep(2)
keyboard.press(Key.enter)
keyboard.release(Key.enter)
print("Message sent!")
# pwk.sendwhatmsg("+2"+str(sys.argv[1]), str(sys.argv[2]), int(str(sys.argv[3])), int(str(sys.argv[4])), 2, tab_close=True)