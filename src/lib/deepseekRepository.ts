import {marked} from 'marked'
import {getDocument, GlobalWorkerOptions} from 'pdfjs-dist/legacy/build/pdf.mjs';
import type {TextItem, TextMarkedContent} from 'pdfjs-dist/types/src/display/api';

import pdfWorker from 'pdfjs-dist/legacy/build/pdf.worker.mjs?url';

GlobalWorkerOptions.workerSrc = pdfWorker;

const ACCESS_TOKEN = import.meta.env.VITE_IO_ACCESS_TOKEN;

export function getPresentationSummary(url: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const presentation = await fetch(`https://docs.google.com/presentation/d/${url}/export/pdf`);
            const dataBuffer = await presentation.arrayBuffer();

            const pdfDocument = await getDocument(new Uint8Array(dataBuffer)).promise;

            let extractedText = '';
            for (let i = 1; i <= pdfDocument.numPages; i++) {
                const page = await pdfDocument.getPage(i);
                const content = await page.getTextContent();
                const pageText = content.items
                    .filter((item: TextItem | TextMarkedContent): item is TextItem => 'str' in item)
                    .map(item => item.str)
                    .join('\n');

                extractedText += `${pageText}\n`;
            }

            const response = await fetch('https://api.intelligence.io.solutions/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${ACCESS_TOKEN}`
                },
                body: JSON.stringify({
                    model: 'deepseek-ai/DeepSeek-R1-0528',
                    messages: [
                        {
                            role: "user",
                            content: `Напиши конспект по тексту презентации: ${extractedText}`
                        }
                    ]
                })
            });

            const json = await response.json();
            const content = json.choices[0].message.content;

            resolve(marked.parse(content.replace(/<think>[\s\S]*?<\/think>/g, '').trim()));
        } catch (error) {
            reject(error);
        }
    });
}
