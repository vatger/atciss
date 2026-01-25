from importlib import import_module
from pathlib import Path
from pkgutil import iter_modules

# ruff: disable[RUF067]
package_dir = Path(__file__).resolve().parent
for _, module_name, _ in iter_modules([package_dir]):
    if module_name != "__init__":
        module = import_module(f"{__name__.replace('.__init__', '')}.{module_name}")
        globals()[module] = module
# ruff: enable[RUF067]
