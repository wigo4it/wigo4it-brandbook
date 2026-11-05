"""Maak de SVG-kaart voor slide 3 uit de Wikimedia-bron, zonder rasterbeelden.

Gebruik vanuit de repo-root: python scripts/build-netherlands-map.py
Bron en licentie staan bij de asset in nederland-bronvermelding.md.
"""
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "examples/cijfers-resultaten-2024-assets"
SVG = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG)


def node(tag, attrs=None, text=None):
    element = ET.Element(f"{{{SVG}}}{tag}", attrs or {})
    element.text = text
    return element


def geometry(group):
    """Behoud brongeometrie en transformatie, zonder editor-instellingen."""
    result = node("g", {"transform": group.attrib["transform"]})
    for source in group:
        tag = source.tag.split("}")[-1]
        if tag not in {"path", "polygon", "polyline"}:
            continue
        attrs = {key: value for key, value in source.attrib.items()
                 if key in {"d", "points", "transform", "fill-rule"}}
        result.append(node(tag, attrs))
    return result


def main():
    source = ET.parse(ASSETS / "sources/netherlands-location-map.svg").getroot()
    width, height = 887.641, 1000.512
    result = node("svg", {
        "viewBox": f"0 0 {width} {height}", "width": str(width), "height": str(height),
        "role": "img", "aria-labelledby": "map-title map-description",
    })
    result.append(node("title", {"id": "map-title"}, "Nederland met de vier grote gemeenten"))
    result.append(node("desc", {"id": "map-description"},
        "Kaart van Europees Nederland met provinciegrenzen. Blauwe stippen markeren "
        "Amsterdam, Rotterdam, Den Haag en Utrecht."))
    result.append(node("metadata", text=
        "Gebaseerd op Netherlands location map.svg van Lencer en Wikimedia-bijdragers "
        "(onder anderen NordNordWest, Io Herodotus en Thayts). "
        "https://commons.wikimedia.org/wiki/File:Netherlands_location_map.svg . "
        "Bron en afgeleide kaart: CC BY-SA 3.0, https://creativecommons.org/licenses/by-sa/3.0/ . "
        "Aanpassingen: alleen Nederland, Wigo4it-kleuren, duidelijkere contouren en vier stadsmarkeringen."))
    groups = {g.attrib.get("id"): g for g in source if g.tag.endswith("}g")}
    land = geometry(groups["layer9"])
    land.set("id", "nederland")
    land.set("fill", "#cfd6cc")
    land.set("stroke", "#005351")
    land.set("stroke-width", "1.8")
    land.set("stroke-linejoin", "round")
    result.append(land)
    borders = node("g", {"id": "provinciegrenzen", 
        "fill": "none", "stroke": "#005351", "stroke-opacity": "0.3",
        "stroke-width": "1.6", "stroke-linejoin": "round"})
    borders.append(geometry(groups["layer5"]))
    result.append(borders)
    cities = node("g", {"id": "steden", "fill": "#434d8e", "stroke": "#ffffff", "stroke-width": "4"})
    # Benaderde stadscentra in WGS84. Equirectangulaire projectie van de bron:
    # west 3.1, oost 7.5, noord 53.7, zuid 50.6. Geen handmatig verschoven stippen.
    for name, lat, lon in [("Amsterdam", 52.3676, 4.9041),
                            ("Rotterdam", 51.9244, 4.4777),
                            ("Den Haag", 52.0705, 4.3007),
                            ("Utrecht", 52.0907, 5.1214)]:
        city = node("g", {"id": name.lower().replace(" ", "-"), "aria-label": name})
        city.append(node("title", text=name))
        city.append(node("circle", {"cx": f"{(lon - 3.1) / 4.4 * width:.3f}",
            "cy": f"{(53.7 - lat) / 3.1 * height:.3f}", "r": "14"}))
        cities.append(city)
    result.append(cities)
    ET.indent(result)
    ET.ElementTree(result).write(ASSETS / "nederland-g4.svg", encoding="utf-8", xml_declaration=True)


if __name__ == "__main__":
    main()
