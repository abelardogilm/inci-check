import io

import pytest
from fastapi.testclient import TestClient
from PIL import Image, ImageDraw

from app import app, average_confidence, group_into_lines, to_unit_scale

client = TestClient(app)


def make_image_bytes(text: str) -> bytes:
    image = Image.new("RGB", (900, 150), color="white")
    draw = ImageDraw.Draw(image)
    draw.text((20, 60), text, fill="black")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def test_health_returns_ok():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_ocr_extracts_text_from_an_image():
    image_bytes = make_image_bytes("Aqua, Parfum, Limonene")

    response = client.post("/ocr", files={"file": ("label.png", image_bytes, "image/png")})

    assert response.status_code == 200
    lines = response.json()["lines"]
    assert any("Limonene" in line["text"] for line in lines)


def test_ocr_reports_a_line_confidence_between_zero_and_one():
    image_bytes = make_image_bytes("Aqua, Parfum, Limonene")

    response = client.post("/ocr", files={"file": ("label.png", image_bytes, "image/png")})

    lines = response.json()["lines"]
    assert all(0 <= line["confidence"] <= 1 for line in lines)


def test_ocr_reports_a_confidence_for_each_word():
    image_bytes = make_image_bytes("Aqua, Parfum, Limonene")

    response = client.post("/ocr", files={"file": ("label.png", image_bytes, "image/png")})

    words = response.json()["lines"][0]["words"]
    assert len(words) == 3
    assert all(0 <= word["confidence"] <= 1 for word in words)


def test_ocr_rejects_a_non_image_upload():
    response = client.post(
        "/ocr", files={"file": ("not-an-image.txt", b"hello world", "text/plain")}
    )

    assert response.status_code == 422


def test_group_into_lines_joins_words_on_the_same_line():
    data = {
        "text": ["Aqua,", "Parfum,", "Limonene"],
        "block_num": [1, 1, 1],
        "par_num": [1, 1, 1],
        "line_num": [1, 1, 1],
        "conf": [95, 90, 85],
    }

    lines = group_into_lines(data)

    assert len(lines) == 1
    assert lines[0].text == "Aqua, Parfum, Limonene"


def test_group_into_lines_keeps_separate_lines_apart():
    data = {
        "text": ["Aqua", "Parfum"],
        "block_num": [1, 1],
        "par_num": [1, 1],
        "line_num": [1, 2],
        "conf": [90, 90],
    }

    lines = group_into_lines(data)

    assert [line.text for line in lines] == ["Aqua", "Parfum"]


def test_group_into_lines_skips_blank_words():
    data = {
        "text": ["Aqua", "", "  "],
        "block_num": [1, 1, 1],
        "par_num": [1, 1, 1],
        "line_num": [1, 1, 1],
        "conf": [90, -1, -1],
    }

    lines = group_into_lines(data)

    assert lines[0].text == "Aqua"


def test_group_into_lines_keeps_each_words_own_confidence():
    data = {
        "text": ["Citric", "Partum"],
        "block_num": [1, 1],
        "par_num": [1, 1],
        "line_num": [1, 1],
        "conf": [95, 41],
    }

    lines = group_into_lines(data)

    assert [(w.text, w.confidence) for w in lines[0].words] == [("Citric", 0.95), ("Partum", 0.41)]


def test_group_into_lines_ignores_negative_confidences_when_averaging():
    data = {
        "text": ["Aqua", "Parfum"],
        "block_num": [1, 1],
        "par_num": [1, 1],
        "line_num": [1, 1],
        "conf": [80, -1],
    }

    lines = group_into_lines(data)

    assert lines[0].confidence == average_confidence([0.8])


def test_to_unit_scale_converts_from_tesseracts_0_100_range():
    assert to_unit_scale(85) == 0.85


def test_to_unit_scale_preserves_the_no_confidence_sentinel():
    assert to_unit_scale(-1) == -1


def test_average_confidence_of_no_confidences_is_zero():
    assert average_confidence([]) == 0.0


def test_average_confidence_averages_unit_scale_values():
    assert average_confidence([0.8, 0.9]) == pytest.approx(0.85)
