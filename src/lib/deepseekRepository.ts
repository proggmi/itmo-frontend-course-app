import { marked } from 'marked';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';
import { PUBLIC_IO_ACCESS_TOKEN } from '$env/static/public';

import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

const ACCESS_TOKEN = PUBLIC_IO_ACCESS_TOKEN;

if (!ACCESS_TOKEN) {
    throw new Error('PUBLIC_IO_ACCESS_TOKEN is missing');
}

export function getPresentationSummary(url: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const presentation = await fetch(
                `https://docs.google.com/presentation/d/${url}/export/pdf`
            );

            if (!presentation.ok) {
                throw new Error(`Failed to fetch presentation PDF: ${presentation.status}`);
            }

            const dataBuffer = await presentation.arrayBuffer();

            const pdfDocument = await getDocument(new Uint8Array(dataBuffer)).promise;

            let extractedText = '';

            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const content = await page.getTextContent();

                const pageText = content.items
                    .filter((item: TextItem | TextMarkedContent): item is TextItem => 'str' in item)
                    .map((item) => item.str)
                    .join('\n');

                extractedText += `${pageText}\n`;
            }

            const response = await fetch(
                'https://api.intelligence.io.solutions/api/v1/chat/completions',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${ACCESS_TOKEN}`
                    },
                    body: JSON.stringify({
                        model: 'deepseek-ai/DeepSeek-R1-0528',
                        messages: [
                            {
                                role: 'user',
                                content: `Напиши конспект по тексту презентации: ${extractedText}`
                            }
                        ]
                    })
                }
            );

            const json = await response.json();

            if (!response.ok) {
                console.error('AI API error:', json);
                throw new Error(json?.error?.message || 'AI API request failed');
            }

            const resultContent = json?.choices?.[0]?.message?.content;

            if (!resultContent) {
                console.error('Unexpected AI response:', json);
                throw new Error('AI response does not contain choices[0].message.content');
            }

            const cleanContent = resultContent.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

            const html = marked.parse(cleanContent);

            resolve(html);
        } catch (error) {
            console.error('getPresentationSummary error:', error);
            reject(error);
        }
    });
}