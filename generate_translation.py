from lxml import html
import sys
import os
import csv

def parse(filename,):
    out = []
    with open(filename) as f:
        tree = html.fromstring(f.read())
        translatable = tree.xpath('//*[@translate]')
        for t in translatable:
            if t.get("translate"):
                print 
                #print t.text.strip()
                out.append(t.get("translate"))

        return out
    
def to_csv(texts, csvfilename, langs=['en', 'it'], base_lang='en'):
    rows = []
    header = ['string_code'] + langs
    base_texts = {}
    if os.path.isfile(csvfilename):
        with open(csvfilename) as csvfile:

            reader = csv.DictReader(csvfile)
            for l in header:
                assert l in reader.fieldnames
            for r in reader:
                rows.append(r)
                base_texts[r['string_code']]=True
    
    for t in texts:
        if t in base_texts:
            pass
        else:
            rows.append({'string_code':t})
            base_texts[t] = True

    
    with open(csvfilename, 'w') as csvfile:
        fieldnames = header
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        writer.writerows(rows)

    



if __name__ == '__main__':
    texts = parse(sys.argv[1])
    to_csv(texts, sys.argv[2])