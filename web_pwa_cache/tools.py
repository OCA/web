# Copyright 2020 Tecnativa - Alexandre Díaz
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl).

def get_hash(data):
    hash1 = 5381
    hash2 = 52711
    for i in reversed(range(len(data))):
        char = ord(data[i])
        hash1 = (hash1 * 33) ^ char
        hash2 = (hash2 * 33) ^ char
    return (((hash1 & 0xFFFFFFFF) >> 0) * 4096 + ((hash2 & 0xFFFFFFFF) >> 0)) & 0xFFFFFFFFFFFFFFFF
