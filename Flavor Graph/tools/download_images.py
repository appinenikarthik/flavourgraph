import urllib.request
from pathlib import Path

base = Path(r"C:\Users\gowth\OneDrive\Desktop\Flavor Graph\static\recipes")
base.mkdir(parents=True, exist_ok=True)

mapping = {
    'garlic_pasta': 'garlic pasta',
    'caprese_salad': 'caprese salad',
    'veggie_omelette': 'vegetable omelette',
    'peanut_stir_fry': 'peanut stir fry'
}

for id_, qry in mapping.items():
    url = f'https://source.unsplash.com/1200x800/?{urllib.request.quote(qry)}'
    out = base / f'{id_}.jpg'
    try:
        print(f'Downloading {id_} from {url} -> {out}')
        urllib.request.urlretrieve(url, out)
        print('  saved', out, 'size', out.stat().st_size)
    except Exception as e:
        print('  failed', id_, e)

print('Done')
