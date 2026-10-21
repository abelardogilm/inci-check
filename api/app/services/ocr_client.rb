# frozen_string_literal: true

# Thin HTTP client for the OCR service (ocr/, see ADR 9). Raises OcrClient::Error
# on any failure so callers can decide whether to skip the image or bail out —
# see ADR 10 for how ScansController uses that.
class OcrClient
  class Error < StandardError; end

  Line = Struct.new(:text, :confidence, :words, keyword_init: true)
  Word = Struct.new(:text, :confidence, keyword_init: true)

  def self.extract_lines(...)
    new.extract_lines(...)
  end

  def initialize(base_url: ENV.fetch("OCR_SERVICE_URL", "http://localhost:8001"))
    @connection = Faraday.new(url: base_url) do |f|
      f.request :multipart
      f.adapter Faraday.default_adapter
    end
  end

  def extract_lines(path:, content_type:, filename: File.basename(path))
    response = connection.post("/ocr") do |req|
      req.body = { file: Faraday::Multipart::FilePart.new(path, content_type, filename) }
    end

    raise Error, "OCR service returned #{response.status}" unless response.success?

    parse(response.body)
  rescue Faraday::ConnectionFailed, Faraday::TimeoutError => e
    raise Error, "Could not reach the OCR service: #{e.message}"
  end

  private

  attr_reader :connection

  def parse(body)
    JSON.parse(body)["lines"].map do |line|
      Line.new(
        text: line["text"],
        confidence: line["confidence"],
        words: Array(line["words"]).map { |w| Word.new(text: w["text"], confidence: w["confidence"]) }
      )
    end
  end
end
