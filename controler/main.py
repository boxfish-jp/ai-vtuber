import pygame
import requests
from urllib.parse import urlencode

pygame.init()
pygame.joystick.init()
joys = pygame.joystick.Joystick(0)
joys.init()

endpoint = "http://localhost:2525"

def sendRequest(endpoint: str, path: str, param: dict):
    try:
        response = requests.get(endpoint + path + "?" + urlencode(param))
        response.raise_for_status()
    except requests.exceptions.RequestException as e:
        print(e)
        pass

def sendViewerComment() -> None:
    param = {
        "who": "viewer",
    }
    sendRequest(endpoint, "", param)

def sendVoiceComment() -> None:
    param = {
        "who": "huguo",
    }
    sendRequest(endpoint, "", param)

if __name__ == "__main__":
    while True:
        eventlist = pygame.event.get()
        if len(eventlist) > 0:
            if eventlist[0].type == pygame.JOYAXISMOTION:
                if eventlist[0].button == 2:
                    sendViewerComment()
                elif eventlist[0].button == 3:
                    sendVoiceComment()